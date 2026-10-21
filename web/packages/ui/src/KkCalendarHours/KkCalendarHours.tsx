import { KkCalendarHoursLane } from './internal/layout/KkCalendarHoursLane';
import { KkCalendarHoursPage } from './internal/layout/KkCalendarHoursPage';
import { KkCalendarHoursRoot } from './internal/layout/KkCalendarHoursRoot';
import { KkCalendarHoursAxis } from './internal/ui/KkCalendarHoursAxis';
import { KkCalendarHoursBlock } from './internal/ui/KkCalendarHoursBlock';
import { KkCalendarHoursDay } from './internal/ui/KkCalendarHoursDay';
import { KkCalendarHoursNeedle } from './internal/ui/KkCalendarHoursNeedle';

export const KkCalendarHours = Object.assign(KkCalendarHoursRoot, {
  Page: KkCalendarHoursPage,
  Axis: KkCalendarHoursAxis,
  Lane: KkCalendarHoursLane,
  Day: KkCalendarHoursDay,
  Block: KkCalendarHoursBlock,
  Needle: KkCalendarHoursNeedle,
});
