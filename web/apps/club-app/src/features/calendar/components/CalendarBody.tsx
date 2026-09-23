import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useCalendarQuery } from '../api';
import { CALENDAR_LOADING_LABEL } from '../calendar-labels';
import { toCalendarErrorMessage } from '../calendar-messages';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import { CalendarError } from './CalendarError';
import { CalendarView } from './CalendarView';

interface CalendarBodyProps {
  board: CalendarBoard;
  highlightedKey: string | null;
}

export const CalendarBody: FC<CalendarBodyProps> = ({ board, highlightedKey }) => {
  const calendar = useCalendarQuery(board.query);
  const scopeSource = useCalendarQuery(board.scopeSourceQuery);
  const { authoring, error: authoringError, retry: retryAuthoring } = useCalendarAuthoring();
  const errorMessage = toCalendarErrorMessage(
    calendar.error ?? scopeSource.error ?? authoringError,
  );

  const reload = (): void => {
    if (calendar.isError) {
      void calendar.refetch();
    }
    if (scopeSource.isError) {
      void scopeSource.refetch();
    }
    retryAuthoring();
  };

  if (calendar.data !== undefined && authoring !== null) {
    return (
      <CalendarView
        board={board}
        entries={calendar.data.entries}
        authoring={authoring}
        highlightedKey={highlightedKey}
      />
    );
  }
  if (errorMessage !== null) {
    return <CalendarError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={CALENDAR_LOADING_LABEL} listShape="rows" />;
};
