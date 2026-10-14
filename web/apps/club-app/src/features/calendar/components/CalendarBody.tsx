import { KkPanelStack, KkRetryAlert } from '@furria/ui';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useCalendarQuery } from '../api';
import { CALENDAR_LOADING_LABEL, CALENDAR_RETRY_LABEL } from '../calendar-labels';
import { toCalendarErrorMessage } from '../calendar-messages';
import { useCalendarAuthoring } from '../hooks/use-calendar-authoring';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarEntry } from '../schemas';
import { CalendarError } from './CalendarError';
import { CalendarView } from './CalendarView';

const NO_ENTRIES: readonly CalendarEntry[] = [];

interface CalendarBodyProps {
  board: CalendarBoard;
  highlightedKey: string | null;
}

export const CalendarBody: FC<CalendarBodyProps> = ({ board, highlightedKey }) => {
  const calendar = useCalendarQuery(board.query);
  const authoringLoad = useCalendarAuthoring();
  const { authoring } = authoringLoad;
  const errorMessage = toCalendarErrorMessage(calendar.error ?? authoringLoad.error);
  const isRetrying = calendar.isFetching || authoringLoad.isRetrying;

  const reload = (): void => {
    if (calendar.isError) {
      void calendar.refetch();
    }
    authoringLoad.retry();
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
  if (authoring !== null && board.view === 'month' && errorMessage !== null) {
    return (
      <KkPanelStack>
        <KkRetryAlert
          message={errorMessage}
          retrying={isRetrying}
          onRetry={reload}
          retryLabel={CALENDAR_RETRY_LABEL}
        />
        <CalendarView
          board={board}
          entries={NO_ENTRIES}
          authoring={authoring}
          highlightedKey={highlightedKey}
        />
      </KkPanelStack>
    );
  }
  if (errorMessage !== null) {
    return <CalendarError message={errorMessage} isRetrying={isRetrying} onRetry={reload} />;
  }

  return <AppListSkeleton label={CALENDAR_LOADING_LABEL} listShape="rows" />;
};
