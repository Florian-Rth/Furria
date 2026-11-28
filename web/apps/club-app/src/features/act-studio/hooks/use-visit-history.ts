import { historyLinesOf } from '@furria/studio/history-turn';
import type { VisitHistory } from '@furria/studio/visit-history';
import { CHANGE_TEXT, HISTORY_UNDONE, visitMetaOf } from '../undo-copy';
import { useStudioHistoryControls } from './use-studio-history-controls';

export const useVisitHistory = (actId: number): VisitHistory => {
  const controls = useStudioHistoryControls(actId);
  const lines = historyLinesOf(controls.view?.snapshot.history ?? []);

  return {
    rows: lines.map((line) => ({
      key: line.key,
      label: CHANGE_TEXT[line.kind],
      meta: visitMetaOf(line.at),
      hint: line.undone ? HISTORY_UNDONE : undefined,
    })),
    canUndo: controls.canUndo,
    canRedo: controls.canRedo,
    status: controls.status,
    undo: controls.undo,
    redo: controls.redo,
    retry: controls.retry,
  };
};
