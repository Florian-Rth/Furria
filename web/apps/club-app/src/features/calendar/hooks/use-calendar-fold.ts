import type {
  KkCalendarDayData,
  KkCalendarPull,
  KkCalendarStripMode,
  KkCalendarTravel,
} from '@furria/ui/calendar-strip-types';
import { kkTokens } from '@furria/ui/tokens';
import { useEffect, useRef, useState } from 'react';
import {
  mondayOf,
  monthDaysOf,
  monthStartOf,
  shiftDay,
  shiftMonth,
  toDayCells,
  weekDaysOf,
} from '../calendar-agenda';
import { toMonthCaption, toMonthName, toWeekCaption } from '../calendar-agenda-copy';
import { toDayData } from '../calendar-agenda-view';
import type { CalendarFoldSpot } from '../calendar-fold';
import { gridRowsOf, mondayOfRow, rowOfDayIn, settleRowOf, weekSpotOf } from '../calendar-fold';
import type { CalendarBoard } from './use-calendar-board';
import type { CalendarWeekPage } from './use-calendar-pager';
import type { CalendarScroll } from './use-calendar-scroll';

export type CalendarFoldView = 'week' | 'month' | 'hours';

const DAYS_IN_WEEK = 7;
const THURSDAY = 3;
const { collapseScroll, morphSeconds } = kkTokens.calendarStrip;
const MS_PER_SECOND = 1000;

interface FoldPage extends CalendarFoldSpot {
  key: string;
  travel: KkCalendarTravel;
}

export interface CalendarFold extends CalendarWeekPage {
  view: CalendarFoldView;
  mode: KkCalendarStripMode;
  open: boolean;
  expanded: boolean;
  rows: number;
  row: number;
  title: string;
  caption: string;
  days: readonly KkCalendarDayData[];
  showsToday: boolean;
  previous: () => void;
  next: () => void;
  today: () => void;
  toggleMonth: () => void;
  toggleOpen: () => void;
  choose: (mode: KkCalendarStripMode) => void;
  pull: (pull: Exclude<KkCalendarPull, 'none'>) => void;
  pickDay: (isoDay: string) => void;
}

const weekPageOf = (isoDay: string, travel: KkCalendarTravel): FoldPage => ({
  ...weekSpotOf(isoDay),
  key: mondayOf(isoDay),
  travel,
});

const towards = (from: string, to: string): KkCalendarTravel => (to > from ? 'later' : 'earlier');

export const useCalendarFold = (board: CalendarBoard, scroll: CalendarScroll): CalendarFold => {
  const [view, setView] = useState<CalendarFoldView>('week');
  const [page, setPage] = useState<FoldPage>(() => weekPageOf(scroll.activeDay, 'none'));
  const [followed, setFollowed] = useState(scroll.activeDay);
  const [picked, setPicked] = useState<string | null>(null);
  const open = view === 'month';
  const expanded = view !== 'week';
  const monday = mondayOfRow(page);
  const activeDay = useRef(scroll.activeDay);

  useEffect(() => {
    activeDay.current = scroll.activeDay;
  });

  if (followed !== scroll.activeDay) {
    setFollowed(scroll.activeDay);
    setPicked(null);

    const target = mondayOf(scroll.activeDay);

    if (!open && target !== monday) {
      setPage(weekPageOf(scroll.activeDay, towards(monday, target)));
    }
  }

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const origin = window.scrollY;
    const onScroll = (): void => {
      if (Math.abs(window.scrollY - origin) > collapseScroll) {
        setView('week');
        setPage((shown) => ({ ...shown, row: settleRowOf(shown.month, activeDay.current) }));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [expanded]);

  const fold = (row: number): void => {
    setView('week');
    setPage({ ...page, row });
  };

  const unfold = (): void => {
    board.peek(page.month);
    setView('month');
  };

  const travelTo = (travel: KkCalendarTravel): void => {
    if (travel === 'none') {
      return;
    }

    const step = travel === 'later' ? 1 : -1;

    if (open) {
      const month = shiftMonth(page.month, step);

      board.peek(month);
      setPage({ month, row: settleRowOf(month, scroll.activeDay), key: `month-${month}`, travel });
      return;
    }

    const next = weekPageOf(shiftDay(monday, step * DAYS_IN_WEEK), travel);

    board.peek(next.month);
    setPage(next);
  };

  const todayMonday = mondayOf(board.todayDay);
  const todayMonth = monthStartOf(board.todayDay);
  const cells = toDayCells(
    monthDaysOf(page.month),
    board.byDay,
    board.owedIds,
    board.todayDay,
    page.month,
  );

  return {
    view,
    mode: view === 'hours' ? 'hours' : 'days',
    open,
    expanded,
    rows: gridRowsOf(page.month),
    row: page.row,
    pageKey: page.key,
    weekDays: weekDaysOf(monday),
    travel: page.travel,
    title: toMonthName(open ? page.month : shiftDay(monday, THURSDAY)),
    caption: open
      ? toMonthCaption(page.month)
      : toWeekCaption(monday, board.todayDay, monday !== todayMonday),
    days: cells.map((cell) => toDayData(cell, picked ?? scroll.activeDay)),
    showsToday: open ? page.month !== todayMonth : monday !== todayMonday,
    travelTo,
    previous: () => {
      travelTo('earlier');
    },
    next: () => {
      travelTo('later');
    },
    today: () => {
      if (open) {
        board.peek(todayMonth);
        setPage({
          month: todayMonth,
          row: settleRowOf(todayMonth, board.todayDay),
          key: `month-${todayMonth}`,
          travel: towards(page.month, todayMonth),
        });
      } else {
        setPage(weekPageOf(board.todayDay, towards(monday, todayMonday)));
      }
      scroll.goToDay(board.todayDay);
    },
    toggleMonth: () => {
      if (open) {
        fold(settleRowOf(page.month, scroll.activeDay));
        return;
      }
      unfold();
    },
    toggleOpen: () => {
      if (expanded) {
        fold(open ? settleRowOf(page.month, scroll.activeDay) : page.row);
        return;
      }
      unfold();
    },
    choose: (mode) => {
      if (mode === 'hours') {
        setPage({ ...page, row: open ? settleRowOf(page.month, scroll.activeDay) : page.row });
        setView('hours');
        return;
      }
      setView('week');
    },
    pull: (direction) => {
      if (direction === 'close') {
        fold(open ? settleRowOf(page.month, scroll.activeDay) : page.row);
        return;
      }
      if (view === 'week') {
        unfold();
      }
    },
    pickDay: (isoDay) => {
      const row = rowOfDayIn(page.month, isoDay);

      if (expanded) {
        setPicked(isoDay);
        window.setTimeout(() => {
          scroll.goToDay(isoDay);
        }, morphSeconds * MS_PER_SECOND);
      } else {
        scroll.goToDay(isoDay);
      }
      if (row === null) {
        setView('week');
        setPage(weekPageOf(isoDay, towards(monday, mondayOf(isoDay))));
        return;
      }
      fold(row);
    },
  };
};
