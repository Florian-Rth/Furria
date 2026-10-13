import type { KkMonthBoardTravel } from '@furria/ui';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { shiftMonth, startOfMonth } from '@/lib/calendar-days';
import { toBoardDay, toBoardWindow } from '../calendar-board';
import type { CalendarQuery } from '../calendar-query';
import {
  ALL_SCOPE_ID,
  parseMonthCursorParam,
  toMonthCursorParam,
  toScopeChoice,
} from '../calendar-query';
import type { CalendarBoardSearch } from '../schemas';

export type CalendarViewMode = 'list' | 'month';

const routeApi = getRouteApi('/_app/calendar');

const NEXT_MONTH = 1;
const PREVIOUS_MONTH = -1;

export interface CalendarBoard {
  scopeId: string;
  view: CalendarViewMode;
  monthCursor: Date;
  today: Date;
  selectedDay: string;
  travel: KkMonthBoardTravel;
  showsToday: boolean;
  query: CalendarQuery;
  scopeSourceQuery: CalendarQuery;
  selectScope: (scopeId: string) => void;
  showList: () => void;
  showMonth: () => void;
  showPreviousMonth: () => void;
  showNextMonth: () => void;
  showToday: () => void;
  selectDay: (isoDay: string) => void;
  addOnSelectedDay: () => void;
}

const travelTowards = (from: Date, to: Date): KkMonthBoardTravel => {
  if (to.getTime() === from.getTime()) {
    return 'none';
  }

  return to > from ? 'later' : 'earlier';
};

export const useCalendarBoard = (): CalendarBoard => {
  const [today] = useState(() => new Date());
  const [travel, setTravel] = useState<KkMonthBoardTravel>('none');
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const scopeId = search.scope ?? ALL_SCOPE_ID;
  const view: CalendarViewMode = search.view ?? 'month';
  const thisMonth = startOfMonth(today);
  const monthCursor = parseMonthCursorParam(search.month, thisMonth);
  const selectedDay = toBoardDay(monthCursor, today, search.day ?? null);
  const showsToday = selectedDay !== toBoardDay(thisMonth, today, null);

  const patch = (next: Partial<CalendarBoardSearch>): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
      resetScroll: false,
    });
  };

  const dayWindow = view === 'month' ? toBoardWindow(monthCursor) : null;
  const from = dayWindow?.from ?? null;
  const to = dayWindow?.to ?? null;
  const choice = toScopeChoice(scopeId);

  const showMonthOf = (cursor: Date): void => {
    setTravel(travelTowards(monthCursor, cursor));
    patch({
      month: cursor.getTime() === thisMonth.getTime() ? undefined : toMonthCursorParam(cursor),
      day: undefined,
    });
  };

  const selectScope = (nextScopeId: string): void => {
    patch({ scope: nextScopeId === ALL_SCOPE_ID ? undefined : nextScopeId });
  };

  const showList = (): void => {
    patch({ view: 'list' });
  };

  const showMonth = (): void => {
    patch({ view: undefined });
  };

  const showPreviousMonth = (): void => {
    showMonthOf(shiftMonth(monthCursor, PREVIOUS_MONTH));
  };

  const showNextMonth = (): void => {
    showMonthOf(shiftMonth(monthCursor, NEXT_MONTH));
  };

  const showToday = (): void => {
    showMonthOf(thisMonth);
  };

  const selectDay = (isoDay: string): void => {
    patch({ day: isoDay });
  };

  const addOnSelectedDay = (): void => {
    void navigate({ to: '/calendar/new', search: (previous) => ({ ...previous, day: selectedDay }) });
  };

  return {
    scopeId,
    view,
    monthCursor,
    today,
    selectedDay,
    travel,
    showsToday,
    query: { scope: choice.scope, groupId: choice.groupId, from, to },
    scopeSourceQuery: { scope: 'all', groupId: null, from, to },
    selectScope,
    showList,
    showMonth,
    showPreviousMonth,
    showNextMonth,
    showToday,
    selectDay,
    addOnSelectedDay,
  };
};
