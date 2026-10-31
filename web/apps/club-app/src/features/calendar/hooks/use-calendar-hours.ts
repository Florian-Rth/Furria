import { hoursMinuteOf } from '@furria/ui/calendar-hours-geometry';
import type { KkCalendarTravel } from '@furria/ui/calendar-strip-types';
import { useNow } from '@/lib/use-now';
import { toClock } from '../calendar-hours';
import type { CalendarHoursWeek } from '../calendar-hours-view';
import { toHoursWeek } from '../calendar-hours-view';
import type { CalendarBoard } from './use-calendar-board';
import type { CalendarWeekPage } from './use-calendar-pager';
import type { CalendarScroll } from './use-calendar-scroll';

const NOW_TICK_MS = 30_000;

export interface CalendarHours {
  week: CalendarHoursWeek;
  pageKey: string;
  travel: KkCalendarTravel;
  nowMinute: number;
  nowClock: string;
  travelTo: (travel: Exclude<KkCalendarTravel, 'none'>) => void;
  select: (id: string) => void;
}

export const useCalendarHours = (
  board: CalendarBoard,
  pager: CalendarWeekPage,
  scroll: CalendarScroll,
): CalendarHours => {
  const now = useNow(NOW_TICK_MS);
  const nowMinute = hoursMinuteOf(now);
  const week = toHoursWeek({
    entries: board.allEntries,
    usuals: board.usuals,
    mayPlan: board.mayPlan,
    weekDays: pager.weekDays,
    todayDay: board.todayDay,
    activeDay: scroll.activeDay,
    selectedId: board.selectedId,
    nowMs: now.getTime(),
    pending: board.pending,
  });

  return {
    week,
    pageKey: pager.pageKey,
    travel: pager.travel,
    nowMinute,
    nowClock: toClock(nowMinute),
    travelTo: pager.travelTo,
    select: (id) => {
      const usual = week.usuals.get(id);

      if (usual === undefined) {
        board.select(Number(id));
        return;
      }
      if (board.mayPlan(usual.groupId)) {
        board.planTraining(usual);
      }
    },
  };
};
