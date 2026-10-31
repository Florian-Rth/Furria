import type { Studio } from '@/features/acts/schemas';
import { HISTORY_FIXED, HISTORY_UNDONE, visitMetaOf, WRITE_TEXT } from '../undo-copy';
import { useStudioHistory } from './use-studio-history';
import { useStudioUndo } from './use-studio-undo';

export interface VisitHistoryRow {
  key: string;
  label: string;
  meta: string;
  hint: string | undefined;
}

export interface VisitHistory {
  rows: VisitHistoryRow[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export const useVisitHistory = (actId: number, studio: Studio): VisitHistory => {
  const { history, canUndo, canRedo } = useStudioHistory(actId);
  const { undo, redo } = useStudioUndo(actId);
  const eveningTitleOf = (eventId: number | null): string | null =>
    studio.evenings.find((evening) => evening.eventId === eventId)?.title ?? null;
  const hintOf = (undone: boolean, fixed: boolean): string | undefined => {
    if (undone) {
      return HISTORY_UNDONE;
    }

    return fixed ? HISTORY_FIXED : undefined;
  };

  return {
    rows: [...history.entries].reverse().map((entry) => ({
      key: String(entry.id),
      label: WRITE_TEXT[entry.kind],
      meta: visitMetaOf(entry.at, eveningTitleOf(entry.eventId)),
      hint: hintOf(entry.state === 'undone', entry.reverse === null),
    })),
    canUndo,
    canRedo,
    undo,
    redo,
  };
};
