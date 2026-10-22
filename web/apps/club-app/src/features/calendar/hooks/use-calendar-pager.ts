import type { KkCalendarDayData, KkCalendarTravel } from '@furria/ui/calendar-strip-types';
import { useState } from 'react';
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
import type { CalendarBoard } from './use-calendar-board';
import type { CalendarScroll } from './use-calendar-scroll';

export type CalendarPagerUnit = 'week' | 'month';

const DAYS_IN_WEEK = 7;
const THURSDAY = 3;
const NEXT = 1;
const PREVIOUS = -1;

export interface CalendarWeekPage {
  pageKey: string;
  weekDays: readonly string[];
  travel: KkCalendarTravel;
  travelTo: (travel: KkCalendarTravel) => void;
}

export interface CalendarPager extends CalendarWeekPage {
  title: string;
  caption: string;
  rows: number;
  days: readonly KkCalendarDayData[];
  showsToday: boolean;
  previous: () => void;
  next: () => void;
  today: () => void;
  selectDay: (isoDay: string) => void;
}

const pageOf = (unit: CalendarPagerUnit, isoDay: string): string =>
  unit === 'week' ? mondayOf(isoDay) : monthStartOf(isoDay);

const stepOf = (unit: CalendarPagerUnit, page: string, direction: number): string =>
  unit === 'week' ? shiftDay(page, direction * DAYS_IN_WEEK) : shiftMonth(page, direction);

export const useCalendarPager = (
  board: CalendarBoard,
  scroll: CalendarScroll,
  unit: CalendarPagerUnit,
): CalendarPager => {
  const [shown, setShown] = useState({
    page: pageOf(unit, scroll.activeDay),
    travel: 'none' as KkCalendarTravel,
  });
  const [followed, setFollowed] = useState(scroll.activeDay);

  if (followed !== scroll.activeDay) {
    setFollowed(scroll.activeDay);

    const page = pageOf(unit, scroll.activeDay);

    if (page !== shown.page) {
      setShown({ page, travel: page > shown.page ? 'later' : 'earlier' });
    }
  }

  const travelTo = (travel: KkCalendarTravel): void => {
    if (travel === 'none') {
      return;
    }

    const page = stepOf(unit, shown.page, travel === 'later' ? NEXT : PREVIOUS);

    setShown({ page, travel });
    board.peek(monthStartOf(page));
  };

  const dayList = unit === 'week' ? weekDaysOf(shown.page) : monthDaysOf(shown.page);
  const cells = toDayCells(
    dayList,
    board.byDay,
    board.owedIds,
    board.todayDay,
    unit === 'month' ? shown.page : null,
  );
  const todayPage = pageOf(unit, board.todayDay);
  const middleDay = unit === 'week' ? shiftDay(shown.page, THURSDAY) : shown.page;

  return {
    pageKey: shown.page,
    weekDays: unit === 'week' ? dayList : [],
    travel: shown.travel,
    title: toMonthName(middleDay),
    caption:
      unit === 'week'
        ? toWeekCaption(shown.page, board.todayDay, todayPage !== shown.page)
        : toMonthCaption(shown.page),
    rows: dayList.length / DAYS_IN_WEEK,
    days: cells.map((cell) => toDayData(cell, scroll.activeDay)),
    showsToday: todayPage !== shown.page,
    travelTo,
    previous: () => {
      travelTo('earlier');
    },
    next: () => {
      travelTo('later');
    },
    today: () => {
      setShown({ page: todayPage, travel: todayPage > shown.page ? 'later' : 'earlier' });
      scroll.goToDay(board.todayDay);
    },
    selectDay: scroll.goToDay,
  };
};
