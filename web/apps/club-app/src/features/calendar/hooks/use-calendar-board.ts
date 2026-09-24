import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { shiftMonth, startOfMonth, toMonthWindow } from '@/lib/calendar-days';
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
  selectedDay: string | null;
  query: CalendarQuery;
  scopeSourceQuery: CalendarQuery;
  selectScope: (scopeId: string) => void;
  showList: () => void;
  showMonth: () => void;
  showPreviousMonth: () => void;
  showNextMonth: () => void;
  selectDay: (isoDay: string) => void;
  clearDay: () => void;
}

export const useCalendarBoard = (): CalendarBoard => {
  const [today] = useState(() => new Date());
  const search = routeApi.useSearch();
  const navigate = useNavigate();

  const scopeId = search.scope ?? ALL_SCOPE_ID;
  const view: CalendarViewMode = search.view ?? 'list';
  const monthCursor = parseMonthCursorParam(search.month, startOfMonth(today));
  const selectedDay = search.day ?? null;

  const patch = (next: Partial<CalendarBoardSearch>): void => {
    void navigate({
      to: '.',
      search: (previous) => ({ ...previous, ...next }),
      replace: true,
      resetScroll: false,
    });
  };

  const dayWindow = view === 'month' ? toMonthWindow(monthCursor) : null;
  const from = dayWindow?.from ?? null;
  const to = dayWindow?.to ?? null;
  const choice = toScopeChoice(scopeId);

  const selectScope = (nextScopeId: string): void => {
    patch({ scope: nextScopeId === ALL_SCOPE_ID ? undefined : nextScopeId });
  };

  const showList = (): void => {
    patch({ view: undefined, day: undefined });
  };

  const showMonth = (): void => {
    patch({ view: 'month' });
  };

  const showPreviousMonth = (): void => {
    patch({ month: toMonthCursorParam(shiftMonth(monthCursor, PREVIOUS_MONTH)), day: undefined });
  };

  const showNextMonth = (): void => {
    patch({ month: toMonthCursorParam(shiftMonth(monthCursor, NEXT_MONTH)), day: undefined });
  };

  const selectDay = (isoDay: string): void => {
    patch({ day: isoDay === selectedDay ? undefined : isoDay });
  };

  const clearDay = (): void => {
    patch({ day: undefined });
  };

  return {
    scopeId,
    view,
    monthCursor,
    today,
    selectedDay,
    query: { scope: choice.scope, groupId: choice.groupId, from, to },
    scopeSourceQuery: { scope: 'all', groupId: null, from, to },
    selectScope,
    showList,
    showMonth,
    showPreviousMonth,
    showNextMonth,
    selectDay,
    clearDay,
  };
};
