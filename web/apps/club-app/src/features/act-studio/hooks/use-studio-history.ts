import { useSyncExternalStore } from 'react';
import type { StudioHistory } from '../studio-history';
import { nextRedoOf, nextUndoOf } from '../studio-history';
import { historyOf, subscribeHistory } from '../studio-history-store';

export interface StudioHistoryView {
  history: StudioHistory;
  canUndo: boolean;
  canRedo: boolean;
}

export const useStudioHistory = (actId: number): StudioHistoryView => {
  const history = useSyncExternalStore(subscribeHistory, () => historyOf(actId));

  return {
    history,
    canUndo: !history.busy && nextUndoOf(history) !== null,
    canRedo: !history.busy && nextRedoOf(history) !== null,
  };
};
