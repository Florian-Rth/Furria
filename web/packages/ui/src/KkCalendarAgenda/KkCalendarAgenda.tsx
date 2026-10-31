import { KkCalendarAgendaDay } from './internal/layout/KkCalendarAgendaDay';
import { KkCalendarAgendaDays } from './internal/layout/KkCalendarAgendaDays';
import { KkCalendarAgendaPanel } from './internal/layout/KkCalendarAgendaPanel';
import { KkCalendarAgendaRoot } from './internal/layout/KkCalendarAgendaRoot';
import { KkCalendarAgendaAnswer } from './internal/ui/KkCalendarAgendaAnswer';
import { KkCalendarAgendaBadge } from './internal/ui/KkCalendarAgendaBadge';
import { KkCalendarAgendaDayHead } from './internal/ui/KkCalendarAgendaDayHead';
import { KkCalendarAgendaGap } from './internal/ui/KkCalendarAgendaGap';
import { KkCalendarAgendaLine } from './internal/ui/KkCalendarAgendaLine';
import { KkCalendarAgendaMore } from './internal/ui/KkCalendarAgendaMore';
import { KkCalendarAgendaQuick } from './internal/ui/KkCalendarAgendaQuick';
import { KkCalendarAgendaTime } from './internal/ui/KkCalendarAgendaTime';
import { KkCalendarAgendaUsual } from './internal/ui/KkCalendarAgendaUsual';

export const KkCalendarAgenda = Object.assign(KkCalendarAgendaRoot, {
  Days: KkCalendarAgendaDays,
  Day: KkCalendarAgendaDay,
  DayHead: KkCalendarAgendaDayHead,
  Panel: KkCalendarAgendaPanel,
  Line: KkCalendarAgendaLine,
  Time: KkCalendarAgendaTime,
  Answer: KkCalendarAgendaAnswer,
  Quick: KkCalendarAgendaQuick,
  Badge: KkCalendarAgendaBadge,
  Gap: KkCalendarAgendaGap,
  More: KkCalendarAgendaMore,
  Usual: KkCalendarAgendaUsual,
});
