import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useCalendarQuery } from '../api';
import { CALENDAR_LOADING_LABEL } from '../calendar-labels';
import { toCalendarErrorMessage } from '../calendar-messages';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { CalendarError } from './CalendarError';
import { CalendarView } from './CalendarView';

interface CalendarBodyProps {
  board: CalendarBoard;
}

export const CalendarBody: FC<CalendarBodyProps> = ({ board }) => {
  const calendar = useCalendarQuery(board.query);
  const errorMessage = toCalendarErrorMessage(calendar.error);

  const reload = (): void => {
    void calendar.refetch();
  };

  if (calendar.data !== undefined) {
    return <CalendarView board={board} entries={calendar.data.entries} />;
  }
  if (errorMessage !== null) {
    return <CalendarError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={CALENDAR_LOADING_LABEL} listShape="rows" />;
};
