import { useState } from 'react';
import { shiftMonth, startOfMonth, toMonthWindow } from '@/lib/calendar-days';
import type { CalendarQuery } from '../calendar-query';
import { ALL_SCOPE_ID, toScopeChoice } from '../calendar-query';

export type CalendarViewMode = 'list' | 'month';

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
  const [scopeId, setScopeId] = useState<string>(ALL_SCOPE_ID);
  const [view, setView] = useState<CalendarViewMode>('list');
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const dayWindow = view === 'month' ? toMonthWindow(monthCursor) : null;
  const from = dayWindow?.from ?? null;
  const to = dayWindow?.to ?? null;
  const choice = toScopeChoice(scopeId);

  const selectScope = (nextScopeId: string): void => {
    setScopeId(nextScopeId);
  };

  const showList = (): void => {
    setView('list');
    setSelectedDay(null);
  };

  const showMonth = (): void => {
    setView('month');
  };

  const showPreviousMonth = (): void => {
    setMonthCursor(shiftMonth(monthCursor, PREVIOUS_MONTH));
    setSelectedDay(null);
  };

  const showNextMonth = (): void => {
    setMonthCursor(shiftMonth(monthCursor, NEXT_MONTH));
    setSelectedDay(null);
  };

  const selectDay = (isoDay: string): void => {
    setSelectedDay(isoDay === selectedDay ? null : isoDay);
  };

  const clearDay = (): void => {
    setSelectedDay(null);
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
