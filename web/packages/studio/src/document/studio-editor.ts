import type { Studio } from '../models/studio-schemas';
import type { AutosaveEvent, AutosaveState, SaveStatus } from './autosave';
import { AUTOSAVE_IDLE, autosaveAfter, saveIsDue, saveStatusOf } from './autosave';
import { documentOf, studioOf } from './document-projection';
import type { EditState, RebaseMode } from './edit-history';
import {
  canRedo,
  canUndo,
  edited,
  editStateOf,
  gestureEnded,
  gestureStarted,
  rebased,
  redone,
  savedUpTo,
  undone,
} from './edit-history';
import type { CreatedCollection, IdMap } from './id-map';
import { localStudioOf, NO_IDS, serverIdOf, serverStudioOf } from './id-map';
import { sameValue } from './same-value';
import type { SaveWrite } from './save-plan';
import { savePlanOf } from './save-plan';
import type { SaveOutcome, StudioSavePort } from './save-port';
import { idsLearnedFrom, savedAfter, serverWriteOf } from './save-run';
import type { StudioChange } from './studio-changes';
import type { StudioDocument } from './studio-document';

export type EditorNote =
  | { kind: 'replayed'; spotIds: readonly number[] }
  | { kind: 'rejected' }
  | { kind: 'undoDropped'; steps: number };

export interface StudioEditorSnapshot<TStudio extends Studio = Studio> {
  studio: TStudio;
  status: SaveStatus;
  canUndo: boolean;
  canRedo: boolean;
  undoAt: number | null;
  redoAt: number | null;
  note: EditorNote | null;
}

export interface EditorClock {
  now: () => number;
  schedule: (run: () => void, delayMs: number) => () => void;
}

export interface StudioEditor<TStudio extends Studio = Studio> {
  snapshot: () => StudioEditorSnapshot<TStudio>;
  savedStudio: () => TStudio;
  subscribe: (listener: () => void) => () => void;
  newLocalId: () => number;
  serverIdOf: (collection: CreatedCollection, id: number) => number | null;
  change: (change: StudioChange) => void;
  startGesture: () => void;
  endGesture: () => void;
  undo: () => void;
  redo: () => void;
  leave: () => Promise<SaveStatus>;
  retry: () => void;
  reload: () => Promise<void>;
  adopt: (fresh: TStudio) => Promise<void>;
  direct: (action: () => Promise<void>) => Promise<void>;
  dismissNote: () => void;
  dispose: () => void;
}

interface EditorSession<TStudio extends Studio> {
  base: TStudio;
  saved: StudioDocument;
  edit: EditState;
  ids: IdMap;
  autosave: AutosaveState;
  note: EditorNote | null;
}

type RunEnd =
  | { kind: 'saved' }
  | { kind: 'refused'; spotIds: readonly number[] }
  | { kind: 'rejected' };

const browserClock: EditorClock = {
  now: () => Date.now(),
  schedule: (run, delayMs) => {
    const timer = setTimeout(run, delayMs);

    return () => clearTimeout(timer);
  },
};

const withVersion = <TStudio extends Studio>(studio: TStudio, version: number): TStudio => ({
  ...studio,
  choreography: { tracks: [], ...studio.choreography, version },
});

const noteOfRun = (end: RunEnd): EditorNote | null => {
  switch (end.kind) {
    case 'refused':
      return { kind: 'replayed', spotIds: end.spotIds };
    case 'rejected':
      return { kind: 'rejected' };
    case 'saved':
      return null;
  }
};

const undoAtOf = (edit: EditState): number | null =>
  (edit.gesture?.patches.length ?? 0) > 0
    ? (edit.gesture?.at ?? null)
    : (edit.past.at(-1)?.at ?? null);

export const createStudioEditor = <TStudio extends Studio>(
  studio: TStudio,
  port: StudioSavePort<TStudio>,
  clock: EditorClock = browserClock,
): StudioEditor<TStudio> => {
  const listeners = new Set<() => void>();
  let lastLocalId = 0;
  let cancelTimer: (() => void) | null = null;
  let running: Promise<void> | null = null;
  let holds = 0;
  let disposed = false;
  let waiting: TStudio | null = null;
  let session: EditorSession<TStudio> = {
    base: studio,
    saved: documentOf(studio),
    edit: editStateOf(documentOf(studio)),
    ids: NO_IDS,
    autosave: AUTOSAVE_IDLE,
    note: null,
  };
  let shown: StudioEditorSnapshot<TStudio> | null = null;

  const snapshot = (): StudioEditorSnapshot<TStudio> => {
    shown ??= {
      studio: studioOf(session.base, session.edit.document),
      status: saveStatusOf(session.autosave),
      canUndo: canUndo(session.edit),
      canRedo: canRedo(session.edit),
      undoAt: undoAtOf(session.edit),
      redoAt: session.edit.future.at(-1)?.at ?? null,
      note: session.note,
    };

    return shown;
  };

  const scheduleSave = (): void => {
    cancelTimer?.();
    cancelTimer = null;
    const dueAt = session.autosave.dueAt;
    if (!disposed && holds === 0 && dueAt !== null && !session.autosave.saving) {
      cancelTimer = clock.schedule(
        () => {
          void saveWhenDue();
        },
        Math.max(0, dueAt - clock.now()),
      );
    }
  };

  const update = (
    next: Partial<EditorSession<TStudio>>,
    events: readonly AutosaveEvent[] = [],
  ): void => {
    if (disposed) {
      return;
    }

    session = {
      ...session,
      ...next,
      autosave: events.reduce(autosaveAfter, session.autosave),
    };
    shown = null;
    scheduleSave();
    for (const listener of listeners) {
      listener();
    }
  };

  const rebasedOnto = (fresh: TStudio, mode: RebaseMode, note: EditorNote | null): void => {
    const base = localStudioOf(fresh, session.ids);
    const saved = documentOf(base);
    const rebase = rebased(session.edit, saved, mode);
    const dropped: EditorNote | null =
      rebase.droppedUndoSteps > 0 ? { kind: 'undoDropped', steps: rebase.droppedUndoSteps } : null;

    update({ base, saved, edit: rebase.state, note: note ?? dropped ?? session.note });
  };

  const recorded = (write: SaveWrite, outcome: SaveOutcome, target: StudioDocument): void => {
    session = {
      ...session,
      ids: idsLearnedFrom(write, outcome, session.ids).ids,
      saved: savedAfter(session.saved, target, write),
      base:
        outcome.kind === 'choreographySaved'
          ? withVersion(session.base, outcome.version)
          : session.base,
    };
  };

  const performed = async (target: StudioDocument): Promise<RunEnd> => {
    for (const write of savePlanOf(session.saved, target)) {
      const serverWrite = serverWriteOf(
        write,
        session.ids,
        session.base.choreography?.version ?? null,
      );
      if (serverWrite === null) {
        return { kind: 'rejected' };
      }

      const outcome = await port.save(serverWrite);
      if (outcome.kind === 'choreographyRefused') {
        return { kind: 'refused', spotIds: outcome.spotIds };
      }
      if (outcome.kind === 'rejected') {
        return { kind: 'rejected' };
      }

      const strays = idsLearnedFrom(write, outcome, session.ids).strayStepIds;
      recorded(write, outcome, target);
      for (const stepId of strays) {
        await port.save({ kind: 'stepRemove', stepId });
      }
    }

    return { kind: 'saved' };
  };

  const runPlan = async (): Promise<void> => {
    const target = session.edit.document;
    const pendingCount = session.edit.pending.length;
    update({}, [{ kind: 'saveStarted' }]);

    try {
      const end = await performed(target);
      if (end.kind === 'saved') {
        update({ edit: savedUpTo(session.edit, pendingCount) }, [
          { kind: 'saveSucceeded', at: clock.now() },
        ]);
        return;
      }

      const fresh = await port.load();
      rebasedOnto(fresh, end.kind === 'refused' ? 'replayPending' : 'dropPending', noteOfRun(end));
      update(
        {},
        end.kind === 'refused'
          ? [{ kind: 'replayed', at: clock.now() }]
          : [{ kind: 'saveSucceeded', at: clock.now() }],
      );
    } catch {
      update({}, [{ kind: 'saveFailed' }]);
    }
  };

  const save = async (): Promise<void> => {
    if (running === null) {
      running = runPlan().finally(() => {
        running = null;
        scheduleSave();
      });
    }
    await running;
  };

  const saveWhenDue = async (): Promise<void> => {
    if (!disposed && holds === 0 && saveIsDue(session.autosave, clock.now())) {
      await save();
    }
  };

  const held = async (work: () => Promise<void>): Promise<void> => {
    holds += 1;
    scheduleSave();
    try {
      await running;
      await work();
    } finally {
      holds -= 1;
      scheduleSave();
    }
  };

  const reloaded = async (): Promise<void> => {
    rebasedOnto(await port.load(), 'replayPending', null);
  };

  const adopted = (fresh: TStudio): void => {
    const base = localStudioOf(fresh, session.ids);
    if (sameValue(documentOf(base), session.saved)) {
      update({ base });
      return;
    }

    rebasedOnto(fresh, 'replayPending', null);
  };

  const adopt = (fresh: TStudio): Promise<void> => {
    if (session.edit.gesture !== null) {
      waiting = fresh;
      return Promise.resolve();
    }

    waiting = null;
    return held(async () => {
      adopted(fresh);
    });
  };

  const flush = async (): Promise<SaveStatus> => {
    update({ edit: gestureEnded(session.edit) }, [{ kind: 'left', at: clock.now() }]);
    await running;
    update({}, [{ kind: 'left', at: clock.now() }]);
    await saveWhenDue();

    return saveStatusOf(session.autosave);
  };

  const historyStep = (edit: EditState, moved: boolean): void => {
    update(
      { edit },
      moved
        ? [
            { kind: 'gestureEnded', at: clock.now() },
            { kind: 'changed', at: clock.now() },
          ]
        : [{ kind: 'gestureEnded', at: clock.now() }],
    );
  };

  return {
    snapshot,
    savedStudio: () => serverStudioOf(studioOf(session.base, session.saved), session.ids),
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    newLocalId: () => {
      lastLocalId -= 1;

      return lastLocalId;
    },
    serverIdOf: (collection, id) => serverIdOf(session.ids, collection, id),
    change: (change) => {
      const edit = edited(session.edit, change, clock.now());
      if (edit !== session.edit) {
        update({ edit }, [{ kind: 'changed', at: clock.now() }]);
      }
    },
    startGesture: () => {
      if (session.edit.gesture === null) {
        update({ edit: gestureStarted(session.edit, clock.now()) }, [{ kind: 'gestureStarted' }]);
      }
    },
    endGesture: () => {
      update({ edit: gestureEnded(session.edit) }, [{ kind: 'gestureEnded', at: clock.now() }]);
      if (waiting !== null) {
        void adopt(waiting);
      }
    },
    undo: () => {
      historyStep(undone(session.edit), canUndo(session.edit));
    },
    redo: () => {
      historyStep(redone(session.edit), canRedo(session.edit));
    },
    leave: flush,
    retry: () => {
      update({ edit: gestureEnded(session.edit) }, [{ kind: 'retried', at: clock.now() }]);
    },
    reload: () => held(reloaded),
    adopt,
    direct: async (action) => {
      await flush();
      await held(async () => {
        try {
          await action();
        } finally {
          await reloaded();
        }
      });
    },
    dismissNote: () => {
      update({ note: null });
    },
    dispose: () => {
      disposed = true;
      cancelTimer?.();
      listeners.clear();
    },
  };
};
