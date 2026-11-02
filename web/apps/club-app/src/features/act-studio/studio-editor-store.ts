import type { SaveStatus } from '@furria/studio/autosave';
import type { StudioEditor, StudioEditorSnapshot } from '@furria/studio/studio-editor';
import { createStudioEditor } from '@furria/studio/studio-editor';
import type { QueryClient } from '@tanstack/react-query';
import { hashKey } from '@tanstack/react-query';
import type { ActStudioResponse, Studio } from '@/features/acts/schemas';
import type { DomainChange } from '@/lib/query/reads';
import { queryKeys, staleQueryKeysAfter } from '@/lib/query/reads';
import { eveningSavedOf, eveningViewOf } from './studio-evening';
import type { EveningSavePort } from './studio-save-port';
import { eveningSavePortOf, studioSavePortOf } from './studio-save-port';

type Listener = () => void;

export interface StudioScope {
  actId: number;
  eventId: number | null;
}

export interface ScopedEditor {
  key: string;
  scope: StudioScope;
  editor: StudioEditor<Studio>;
}

export interface EditorView extends ScopedEditor {
  snapshot: StudioEditorSnapshot<Studio>;
}

const CLOSE_GRACE_MS = 5000;
const SESSION_CHANGES: readonly DomainChange[] = [
  'actMusic',
  'actSteps',
  'actVideos',
  'actChoreography',
];
const EVENING_CHANGES: readonly DomainChange[] = ['actEvening'];
const NONE: readonly ScopedEditor[] = [];
const NO_VIEWS: readonly EditorView[] = [];

interface OpenEditor extends ScopedEditor {
  evening: EveningSavePort | null;
  holders: number;
  closing: number | null;
  detach: () => void;
}

const editors = new Map<string, OpenEditor>();
const listed = new Map<number, readonly ScopedEditor[]>();
const views = new Map<number, readonly EditorView[]>();
const listeners = new Set<Listener>();

export const scopeKeyOf = ({ actId, eventId }: StudioScope): string =>
  eventId === null ? String(actId) : `${actId}:${eventId}`;

const announce = (): void => {
  listed.clear();
  for (const listener of listeners) {
    listener();
  }
};

const savedInto = (open: OpenEditor, current: Studio): Studio => {
  const saved = open.editor.savedStudio();
  const { eventId } = open.scope;

  return eventId === null || open.evening === null
    ? { ...saved, evenings: current.evenings, trainings: current.trainings }
    : eveningSavedOf(current, eventId, saved, open.evening.copied());
};

const cacheSaved = (key: string, queryClient: QueryClient): void => {
  const open = editors.get(key);
  if (open === undefined) {
    return;
  }

  const { scope } = open;
  const studioKey = queryKeys.actStudio(scope.actId);
  const studioHash = hashKey(studioKey);
  queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
    current === undefined || current.studio === null
      ? current
      : { ...current, studio: savedInto(open, current.studio) },
  );
  void queryClient.invalidateQueries({ queryKey: studioKey, refetchType: 'none' });
  for (const queryKey of staleQueryKeysAfter(
    scope.eventId === null ? SESSION_CHANGES : EVENING_CHANGES,
  )) {
    void queryClient.invalidateQueries({
      queryKey,
      predicate: (query) => hashKey(query.queryKey) !== studioHash,
    });
  }
};

const attached = (
  key: string,
  editor: StudioEditor<Studio>,
  queryClient: QueryClient,
): (() => void) => {
  let status: SaveStatus = editor.snapshot().status;
  const stopWatching = editor.subscribe(() => {
    const next = editor.snapshot().status;
    if (status !== 'saved' && next === 'saved') {
      cacheSaved(key, queryClient);
      closeWhenUnheld(key, editor);
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

export const studioEditorOf = (scope: StudioScope): StudioEditor<Studio> | null =>
  editors.get(scopeKeyOf(scope))?.editor ?? null;

export const studioEditorsOf = (actId: number): readonly ScopedEditor[] => {
  const known = listed.get(actId);
  if (known !== undefined) {
    return known;
  }

  const found = [...editors.values()]
    .filter((open) => open.scope.actId === actId)
    .map(({ key, scope, editor }) => ({ key, scope, editor }));
  const kept = found.length === 0 ? NONE : found;
  listed.set(actId, kept);

  return kept;
};

const closeWhenUnheld = (key: string, editor: StudioEditor<Studio>): void => {
  const open = editors.get(key);
  if (open?.editor !== editor || open.holders > 0) {
    return;
  }

  if (open.closing !== null) {
    window.clearTimeout(open.closing);
  }
  editors.set(key, {
    ...open,
    closing: window.setTimeout(() => {
      const latest = editors.get(key);
      if (
        latest?.editor === editor &&
        latest.holders === 0 &&
        editor.snapshot().status === 'saved'
      ) {
        editors.delete(key);
        latest.detach();
        editor.dispose();
        announce();
      }
    }, CLOSE_GRACE_MS),
  });
};

const editorStudioOf = (scope: StudioScope, studio: Studio): Studio =>
  scope.eventId === null ? studio : eveningViewOf(studio, scope.eventId);

export const openStudioEditor = (
  scope: StudioScope,
  studio: Studio,
  queryClient: QueryClient,
): StudioEditor<Studio> => {
  const key = scopeKeyOf(scope);
  const known = editors.get(key);
  if (known !== undefined) {
    return known.editor;
  }

  const evening =
    scope.eventId === null
      ? null
      : eveningSavePortOf(scope.actId, scope.eventId, queryClient, studio);
  const editor = createStudioEditor(
    editorStudioOf(scope, studio),
    evening ?? studioSavePortOf(scope.actId, queryClient),
  );
  editors.set(key, {
    key,
    scope,
    editor,
    evening,
    holders: 0,
    closing: null,
    detach: attached(key, editor, queryClient),
  });
  listed.delete(scope.actId);
  closeWhenUnheld(key, editor);

  return editor;
};

export const adoptStudio = (scope: StudioScope, studio: Studio): void => {
  const open = editors.get(scopeKeyOf(scope));
  if (open === undefined) {
    return;
  }

  open.evening?.observe(studio);
  void open.editor.adopt(editorStudioOf(scope, studio));
};

export const holdStudioEditor = (scope: StudioScope): void => {
  const key = scopeKeyOf(scope);
  const open = editors.get(key);
  if (open === undefined) {
    return;
  }

  if (open.closing !== null) {
    window.clearTimeout(open.closing);
  }
  editors.set(key, { ...open, holders: open.holders + 1, closing: null });
  announce();
};

export const releaseStudioEditor = (scope: StudioScope): void => {
  const key = scopeKeyOf(scope);
  const open = editors.get(key);
  if (open === undefined) {
    return;
  }

  editors.set(key, { ...open, holders: Math.max(0, open.holders - 1) });
  if (open.holders <= 1) {
    void open.editor.leave().finally(() => {
      closeWhenUnheld(key, open.editor);
    });
  }
};

export const throughStudioEditor = <TResult>(
  scope: StudioScope,
  action: () => Promise<TResult>,
): Promise<TResult> => studioEditorOf(scope)?.direct(action) ?? action();

export const subscribeStudioEditors = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const viewsAreCurrent = (known: readonly EditorView[], current: readonly ScopedEditor[]): boolean =>
  known.length === current.length &&
  known.every(
    (view, index) =>
      view.editor === current[index]?.editor && view.snapshot === view.editor.snapshot(),
  );

export const editorViewsOf = (actId: number): readonly EditorView[] => {
  const current = studioEditorsOf(actId);
  const known = views.get(actId);
  if (known !== undefined && viewsAreCurrent(known, current)) {
    return known;
  }

  const next =
    current.length === 0
      ? NO_VIEWS
      : current.map((scoped) => ({ ...scoped, snapshot: scoped.editor.snapshot() }));
  views.set(actId, next);

  return next;
};

export const subscribeEditorViews = (actId: number, listener: Listener): (() => void) => {
  let stops: (() => void)[] = [];
  const watch = (): void => {
    for (const stop of stops) {
      stop();
    }
    stops = studioEditorsOf(actId).map(({ editor }) => editor.subscribe(listener));
  };
  watch();
  const stopStore = subscribeStudioEditors(() => {
    watch();
    listener();
  });

  return () => {
    stopStore();
    for (const stop of stops) {
      stop();
    }
  };
};
