import type { SaveStatus } from '@furria/studio/autosave';
import type { Studio } from '@/features/acts/schemas';
import { HISTORY_FIXED, HISTORY_UNDONE, visitMetaOf, WRITE_TEXT } from '../undo-copy';
import { useStudioHistory } from './use-studio-history';
import { useStudioHistoryControls } from './use-studio-history-controls';

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
  status: SaveStatus | null;
  undo: () => void;
  redo: () => void;
  retry: () => void;
}

export const useVisitHistory = (actId: number, studio: Studio): VisitHistory => {
  const { history } = useStudioHistory(actId);
  const controls = useStudioHistoryControls(actId);
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
    canUndo: controls.canUndo,
    canRedo: controls.canRedo,
    status: controls.status,
    undo: controls.undo,
    redo: controls.redo,
    retry: controls.retry,
  };
};
