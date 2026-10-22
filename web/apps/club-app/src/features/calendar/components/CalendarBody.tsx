import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session/components/AppListSkeleton';
import { ERROR_MESSAGE, LOADING_LABEL, RETRY_LABEL } from '../calendar-agenda-copy';
import type { CalendarBoard } from '../hooks/use-calendar-board';
import type { CalendarScroll } from '../hooks/use-calendar-scroll';
import { CalendarDesk } from './CalendarDesk';
import { CalendarPhone } from './CalendarPhone';

interface CalendarBodyProps {
  board: CalendarBoard;
  scroll: CalendarScroll;
  isWide: boolean;
}

export const CalendarBody: FC<CalendarBodyProps> = ({ board, scroll, isWide }) => {
  if (board.phase === 'loading') {
    return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
  }
  if (board.phase === 'failed') {
    return (
      <KkRetryAlert
        message={ERROR_MESSAGE}
        retrying={board.isFetching}
        onRetry={board.retry}
        retryLabel={RETRY_LABEL}
      />
    );
  }
  if (isWide) {
    return <CalendarDesk board={board} scroll={scroll} />;
  }

  return <CalendarPhone board={board} scroll={scroll} />;
};
