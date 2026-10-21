import { KkCalendarStripBar } from './internal/layout/KkCalendarStripBar';
import { KkCalendarStripBody } from './internal/layout/KkCalendarStripBody';
import { KkCalendarStripRoot } from './internal/layout/KkCalendarStripRoot';
import { KkCalendarStripTools } from './internal/layout/KkCalendarStripTools';
import { KkCalendarStripWeeks } from './internal/layout/KkCalendarStripWeeks';
import { KkCalendarStripDay } from './internal/ui/KkCalendarStripDay';
import { KkCalendarStripExpand } from './internal/ui/KkCalendarStripExpand';
import { KkCalendarStripGrip } from './internal/ui/KkCalendarStripGrip';
import { KkCalendarStripModes } from './internal/ui/KkCalendarStripModes';
import { KkCalendarStripTitle } from './internal/ui/KkCalendarStripTitle';
import { KkCalendarStripTravel } from './internal/ui/KkCalendarStripTravel';
import { KkCalendarStripWeekdays } from './internal/ui/KkCalendarStripWeekdays';

export const KkCalendarStrip = Object.assign(KkCalendarStripRoot, {
  Bar: KkCalendarStripBar,
  Title: KkCalendarStripTitle,
  Tools: KkCalendarStripTools,
  Modes: KkCalendarStripModes,
  Travel: KkCalendarStripTravel,
  Expand: KkCalendarStripExpand,
  Body: KkCalendarStripBody,
  Weekdays: KkCalendarStripWeekdays,
  Weeks: KkCalendarStripWeeks,
  Day: KkCalendarStripDay,
  Grip: KkCalendarStripGrip,
});
