import type { SaveStatus } from '@furria/studio/autosave';
import { useSyncExternalStore } from 'react';
import type { EditorView } from '../studio-editor-store';
import { editorViewOf, subscribeStudioEditor } from '../studio-editor-store';

export interface StudioHistoryControls {
  view: EditorView | null;
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus | null;
  undo: () => void;
  redo: () => void;
  retry: () => void;
}

export const useStudioHistoryControls = (actId: number | null): StudioHistoryControls => {
  const view = useSyncExternalStore(
    (listener) => subscribeStudioEditor(actId, listener),
    () => editorViewOf(actId),
  );

  return {
    view,
    canUndo: view?.snapshot.canUndo ?? false,
    canRedo: view?.snapshot.canRedo ?? false,
    status: view?.snapshot.status ?? null,
    undo: () => {
      view?.editor.undo();
    },
    redo: () => {
      view?.editor.redo();
    },
    retry: () => {
      if (view?.snapshot.status === 'failed') {
        view.editor.retry();
      }
    },
  };
};
