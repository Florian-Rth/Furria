import type { SaveStatus } from '@furria/studio/autosave';
import type { StudioEditor, StudioEditorSnapshot } from '@furria/studio/studio-editor';
import { useSyncExternalStore } from 'react';
import type { Studio } from '@/features/acts/schemas';
import type { HistoryTops } from '../history-turn';
import { redoStackOf, undoStackOf } from '../history-turn';
import { studioEditorOf, subscribeStudioEditors } from '../studio-editor-store';
import { nextRedoOf, nextUndoOf } from '../studio-history';
import { useStudioHistory } from './use-studio-history';
import { useStudioUndo } from './use-studio-undo';

export interface StudioHistoryControls {
  editor: StudioEditor<Studio> | null;
  note: StudioEditorSnapshot<Studio>['note'];
  canUndo: boolean;
  canRedo: boolean;
  status: SaveStatus | null;
  undo: () => void;
  redo: () => void;
  retry: () => void;
}

const NO_SUBSCRIPTION = (): (() => void) => () => undefined;
const NO_SNAPSHOT = (): null => null;

const atOf = (at: string | undefined): number | null => (at === undefined ? null : Date.parse(at));

export const useStudioHistoryControls = (actId: number): StudioHistoryControls => {
  const editor = useSyncExternalStore(subscribeStudioEditors, () => studioEditorOf(actId));
  const snapshot = useSyncExternalStore(
    editor?.subscribe ?? NO_SUBSCRIPTION,
    editor?.snapshot ?? NO_SNAPSHOT,
  );
  const visit = useStudioHistory(actId);
  const visitUndo = useStudioUndo(actId);
  const settled = !visit.history.busy;
  const undoTops: HistoryTops = {
    document: snapshot?.canUndo === true ? snapshot.undoAt : null,
    visit: visit.canUndo ? atOf(nextUndoOf(visit.history)?.at) : null,
  };
  const redoTops: HistoryTops = {
    document: snapshot?.canRedo === true ? snapshot.redoAt : null,
    visit: visit.canRedo ? atOf(nextRedoOf(visit.history)?.at) : null,
  };

  const undoStack = settled ? undoStackOf(undoTops) : null;
  const redoStack = settled ? redoStackOf(redoTops, undoTops) : null;

  return {
    editor,
    note: snapshot?.note ?? null,
    canUndo: undoStack !== null,
    canRedo: redoStack !== null,
    status: snapshot?.status ?? null,
    undo: () => {
      if (undoStack === 'document') {
        editor?.undo();
      }
      if (undoStack === 'visit') {
        visitUndo.undo();
      }
    },
    redo: () => {
      if (redoStack === 'document') {
        editor?.redo();
      }
      if (redoStack === 'visit') {
        visitUndo.redo();
      }
    },
    retry: () => {
      editor?.retry();
    },
  };
};
