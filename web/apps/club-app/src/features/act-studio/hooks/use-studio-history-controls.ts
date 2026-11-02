import type { SaveStatus } from '@furria/studio/autosave';
import { useSyncExternalStore } from 'react';
import type { HistoryTop } from '../history-turn';
import { combinedStatusOf, redoTurnOf, undoTurnOf } from '../history-turn';
import type { EditorView } from '../studio-editor-store';
import { editorViewsOf, subscribeEditorViews } from '../studio-editor-store';

export interface StudioHistoryControls {
  views: readonly EditorView[];
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus | null;
  undo: () => void;
  redo: () => void;
  retry: () => void;
}

const topOf = ({ key, snapshot }: EditorView): HistoryTop => ({
  key,
  undoAt: snapshot.canUndo ? snapshot.undoAt : null,
  redoAt: snapshot.canRedo ? snapshot.redoAt : null,
});

export const useStudioHistoryControls = (actId: number): StudioHistoryControls => {
  const views = useSyncExternalStore(
    (listener) => subscribeEditorViews(actId, listener),
    () => editorViewsOf(actId),
  );
  const tops = views.map(topOf);
  const undoKey = undoTurnOf(tops);
  const redoKey = redoTurnOf(tops);
  const viewOf = (key: string | null): EditorView | null =>
    views.find((view) => view.key === key) ?? null;

  return {
    views,
    canUndo: undoKey !== null,
    canRedo: redoKey !== null,
    status: combinedStatusOf(views.map((view) => view.snapshot.status)),
    undo: () => {
      viewOf(undoKey)?.editor.undo();
    },
    redo: () => {
      viewOf(redoKey)?.editor.redo();
    },
    retry: () => {
      for (const view of views) {
        if (view.snapshot.status === 'failed') {
          view.editor.retry();
        }
      }
    },
  };
};
