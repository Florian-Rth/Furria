import { KkCalendarStripBar } from '../KkCalendarStrip/internal/layout/KkCalendarStripBar';
import { KkCalendarStripTools } from '../KkCalendarStrip/internal/layout/KkCalendarStripTools';
import { KkCalendarStripWeeks } from '../KkCalendarStrip/internal/layout/KkCalendarStripWeeks';
import { KkCalendarStripDay } from '../KkCalendarStrip/internal/ui/KkCalendarStripDay';
import { KkCalendarStripTitle } from '../KkCalendarStrip/internal/ui/KkCalendarStripTitle';
import { KkCalendarStripTravel } from '../KkCalendarStrip/internal/ui/KkCalendarStripTravel';
import { KkCalendarStripWeekdays } from '../KkCalendarStrip/internal/ui/KkCalendarStripWeekdays';
import { KkCalendarMonthRoot } from './internal/layout/KkCalendarMonthRoot';

export const KkCalendarMonth = Object.assign(KkCalendarMonthRoot, {
  Bar: KkCalendarStripBar,
  Title: KkCalendarStripTitle,
  Tools: KkCalendarStripTools,
  Travel: KkCalendarStripTravel,
  Weekdays: KkCalendarStripWeekdays,
  Grid: KkCalendarStripWeeks,
  Day: KkCalendarStripDay,
});
