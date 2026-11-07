import { historyLinesOf } from '@furria/studio/history-turn';
import type { VisitHistory } from '@furria/studio/visit-history';
import type { ActStudio } from '@/features/acts/schemas';
import { CHANGE_TEXT, HISTORY_UNDONE, visitMetaOf } from '../undo-copy';
import { useStudioHistoryControls } from './use-studio-history-controls';

export const useVisitHistory = (actId: number, studio: ActStudio): VisitHistory => {
  const controls = useStudioHistoryControls(actId);
  const eveningTitleOf = (eventId: number | null): string | null =>
    studio.evenings.find((evening) => evening.eventId === eventId)?.title ?? null;
  const lines = historyLinesOf(
    controls.views.map((view) => ({
      key: view.key,
      eventId: view.scope.eventId,
      records: view.snapshot.history,
    })),
  );

  return {
    rows: lines.map((line) => ({
      key: line.key,
      label: CHANGE_TEXT[line.kind],
      meta: visitMetaOf(line.at, eveningTitleOf(line.eventId)),
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
