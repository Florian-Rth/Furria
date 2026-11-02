import type { SaveStatus } from '@furria/studio/autosave';
import type { StudioEditor } from '@furria/studio/studio-editor';
import { createStudioEditor } from '@furria/studio/studio-editor';
import type { QueryClient } from '@tanstack/react-query';
import { hashKey } from '@tanstack/react-query';
import type { ActStudioResponse, Studio } from '@/features/acts/schemas';
import type { DomainChange } from '@/lib/query/reads';
import { queryKeys, staleQueryKeysAfter } from '@/lib/query/reads';
import { studioSavePortOf } from './studio-save-port';

type Listener = () => void;

const CLOSE_GRACE_MS = 5000;
const SAVED_CHANGES: readonly DomainChange[] = [
  'actMusic',
  'actSteps',
  'actVideos',
  'actChoreography',
];

interface OpenEditor {
  editor: StudioEditor<Studio>;
  holders: number;
  closing: number | null;
  detach: () => void;
}

const editors = new Map<number, OpenEditor>();
const listeners = new Set<Listener>();

const announce = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const cacheSaved = (
  actId: number,
  editor: StudioEditor<Studio>,
  queryClient: QueryClient,
): void => {
  const studioKey = queryKeys.actStudio(actId);
  const studioHash = hashKey(studioKey);
  queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
    current === undefined || current.studio === null
      ? current
      : { ...current, studio: editor.savedStudio() },
  );
  void queryClient.invalidateQueries({ queryKey: studioKey, refetchType: 'none' });
  for (const queryKey of staleQueryKeysAfter(SAVED_CHANGES)) {
    void queryClient.invalidateQueries({
      queryKey,
      predicate: (query) => hashKey(query.queryKey) !== studioHash,
    });
  }
};

const attached = (
  actId: number,
  editor: StudioEditor<Studio>,
  queryClient: QueryClient,
): (() => void) => {
  let status: SaveStatus = editor.snapshot().status;
  const stopWatching = editor.subscribe(() => {
    const next = editor.snapshot().status;
    if (status !== 'saved' && next === 'saved') {
      cacheSaved(actId, editor, queryClient);
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

export const studioEditorOf = (actId: number): StudioEditor<Studio> | null =>
  editors.get(actId)?.editor ?? null;

const closeWhenUnheld = (actId: number, editor: StudioEditor<Studio>): void => {
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
        latest.detach();
        editor.dispose();
        announce();
      }
    }, CLOSE_GRACE_MS),
  });
};

export const openStudioEditor = (
  actId: number,
  studio: Studio,
  queryClient: QueryClient,
): StudioEditor<Studio> => {
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

export const subscribeStudioEditors = (listener: Listener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
