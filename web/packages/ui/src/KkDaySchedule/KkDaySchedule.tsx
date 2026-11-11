import { KkDayScheduleRoot } from './internal/layout/KkDayScheduleRoot';
import { KkDayScheduleSteps } from './internal/layout/KkDayScheduleSteps';
import { KkDayScheduleDay } from './internal/ui/KkDayScheduleDay';
import { KkDayScheduleHead } from './internal/ui/KkDayScheduleHead';
import { KkDayScheduleStep } from './internal/ui/KkDayScheduleStep';

export type { KkDayScheduleHeading } from './internal/ui/KkDayScheduleHead';

export const KkDaySchedule = Object.assign(KkDayScheduleRoot, {
  Head: KkDayScheduleHead,
  Day: KkDayScheduleDay,
  Steps: KkDayScheduleSteps,
  Step: KkDayScheduleStep,
});
