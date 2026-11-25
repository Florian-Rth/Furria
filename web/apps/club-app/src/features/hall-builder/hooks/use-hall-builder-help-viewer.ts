import { usePlanTouchMode } from '@/features/hall-plan/use-plan-touch-mode';

export interface HallBuilderHelpViewer {
  isTouch: boolean;
}

export const useHallBuilderHelpViewer = (): HallBuilderHelpViewer => {
  const { isTouch } = usePlanTouchMode();

  return { isTouch };
};
