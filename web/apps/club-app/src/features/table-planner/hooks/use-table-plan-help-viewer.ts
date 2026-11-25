import { usePlanTouchMode } from '@/features/hall-plan/use-plan-touch-mode';
import type { TablePlannerStage } from './use-table-planner-screen';

export interface TablePlanHelpViewer {
  isTouch: boolean;
  isStarting: boolean;
}

export const useTablePlanHelpViewer = (stage: TablePlannerStage): TablePlanHelpViewer => {
  const { isTouch } = usePlanTouchMode();

  return { isTouch, isStarting: stage.kind === 'start' };
};
