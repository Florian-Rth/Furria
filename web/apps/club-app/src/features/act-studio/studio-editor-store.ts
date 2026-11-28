import type { SaveStatus } from '@furria/studio/autosave';
import type { StudioEditor, StudioEditorSnapshot } from '@furria/studio/studio-editor';
import { createStudioEditor } from '@furria/studio/studio-editor';
import type { QueryClient } from '@tanstack/react-query';
import { hashKey } from '@tanstack/react-query';
import type { ActStudio, ActStudioResponse } from '@/features/acts/schemas';
import type { DomainChange } from '@/lib/query/reads';
import { queryKeys, staleQueryKeysAfter } from '@/lib/query/reads';
import { studioSavePortOf } from './studio-save-port';

type Listener = () => void;

export interface EditorView {
  editor: StudioEditor<ActStudio>;
  snapshot: StudioEditorSnapshot<ActStudio>;
}

const CLOSE_GRACE_MS = 5000;
const STUDIO_CHANGES: readonly DomainChange[] = [
  'actMusic',
  'actSteps',
  'actVideos',
  'actChoreography',
];

interface OpenEditor {
  editor: StudioEditor<ActStudio>;
  holders: number;
  closing: number | null;
  detach: () => void;
}

const editors = new Map<number, OpenEditor>();
const views = new Map<number, EditorView>();
const listeners = new Set<Listener>();

const announce = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const savedInto = (open: OpenEditor, current: ActStudio): ActStudio => ({
  ...open.editor.savedStudio(),
  trainings: current.trainings,
});

const cacheSaved = (actId: number, queryClient: QueryClient): void => {
  const open = editors.get(actId);
  if (open === undefined) {
    return;
  }

  const studioKey = queryKeys.actStudio(actId);
  const studioHash = hashKey(studioKey);
  queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
    current === undefined || current.studio === null
      ? current
      : { ...current, studio: savedInto(open, current.studio) },
  );
  void queryClient.invalidateQueries({ queryKey: studioKey, refetchType: 'none' });
  for (const queryKey of staleQueryKeysAfter(STUDIO_CHANGES)) {
    void queryClient.invalidateQueries({
      queryKey,
      predicate: (query) => hashKey(query.queryKey) !== studioHash,
    });
  }
};

const attached = (
  actId: number,
  editor: StudioEditor<ActStudio>,
  queryClient: QueryClient,
): (() => void) => {
  let status: SaveStatus = editor.snapshot().status;
  const stopWatching = editor.subscribe(() => {
    const next = editor.snapshot().status;
    if (status !== 'saved' && next === 'saved') {
      cacheSaved(actId, queryClient);
      closeWhenUnheld(actId, editor);
    }
    status = next;
  });
  const flush = (): void => {
    if (document.visibilityState === 'hidden') {
      void editor.leave();
    }
  };
  const leave = (): void => {
    void editor.leave();
  };
  document.addEventListener('visibilitychange', flush);
  window.addEventListener('pagehide', leave);

  return () => {
    stopWatching();
    document.removeEventListener('visibilitychange', flush);
    window.removeEventListener('pagehide', leave);
  };
};

const studioEditorOf = (actId: number | null): StudioEditor<ActStudio> | null =>
  actId === null ? null : (editors.get(actId)?.editor ?? null);

const closeWhenUnheld = (actId: number, editor: StudioEditor<ActStudio>): void => {
  const open = editors.get(actId);
  if (open?.editor !== editor || open.holders > 0) {
    return;
  }

  if (open.closing !== null) {
    window.clearTimeout(open.closing);
  }
  editors.set(actId, {
    ...open,
    closing: window.setTimeout(() => {
      const latest = editors.get(actId);
      if (
        latest?.editor === editor &&
        latest.holders === 0 &&
        editor.snapshot().status === 'saved'
      ) {
        editors.delete(actId);
        views.delete(actId);
        latest.detach();
        editor.dispose();
        announce();
      }
    }, CLOSE_GRACE_MS),
  });
};

export const openStudioEditor = (
  actId: number,
  studio: ActStudio,
  queryClient: QueryClient,
): StudioEditor<ActStudio> => {
  const known = editors.get(actId);
  if (known !== undefined) {
    return known.editor;
  }

  const editor = createStudioEditor(studio, studioSavePortOf(actId, queryClient));
  editors.set(actId, {
    editor,
    holders: 0,
    closing: null,
    detach: attached(actId, editor, queryClient),
  });
  closeWhenUnheld(actId, editor);

  return editor;
};

export const adoptStudio = (actId: number, studio: ActStudio): void => {
  const open = editors.get(actId);
  if (open === undefined) {
    return;
  }

  void open.editor.adopt(studio);
};

export const holdStudioEditor = (actId: number): void => {
  const open = editors.get(actId);
  if (open === undefined) {
    return;
  }

  if (open.closing !== null) {
    window.clearTimeout(open.closing);
  }
  editors.set(actId, { ...open, holders: open.holders + 1, closing: null });
  announce();
};

export const releaseStudioEditor = (actId: number): void => {
  const open = editors.get(actId);
  if (open === undefined) {
    return;
  }

  editors.set(actId, { ...open, holders: Math.max(0, open.holders - 1) });
  if (open.holders <= 1) {
    void open.editor.leave().finally(() => {
      closeWhenUnheld(actId, open.editor);
    });
  }
};

export const throughStudioEditor = <TResult>(
  actId: number,
  action: () => Promise<TResult>,
): Promise<TResult> => studioEditorOf(actId)?.direct(action) ?? action();

export const editorViewOf = (actId: number | null): EditorView | null => {
  const editor = studioEditorOf(actId);
  if (actId === null || editor === null) {
    return null;
  }

  const snapshot = editor.snapshot();
  const known = views.get(actId);
  if (known?.editor === editor && known.snapshot === snapshot) {
    return known;
  }

  const view = { editor, snapshot };
  views.set(actId, view);

  return view;
};

export const subscribeStudioEditor = (actId: number | null, listener: Listener): (() => void) => {
  let stopEditor: (() => void) | null = null;
  const watch = (): void => {
    stopEditor?.();
    stopEditor = studioEditorOf(actId)?.subscribe(listener) ?? null;
  };
  const onStoreChange = (): void => {
    watch();
    listener();
  };
  watch();
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
    stopEditor?.();
  };
};
