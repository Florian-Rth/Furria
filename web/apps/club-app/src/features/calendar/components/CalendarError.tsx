import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import type { FC } from 'react';
import { CALENDAR_ERROR_TITLE, CALENDAR_RETRY_LABEL } from '../calendar-labels';

interface CalendarErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const CalendarError: FC<CalendarErrorProps> = ({ message, isRetrying, onRetry }) => (
  <KkErrorState
    title={CALENDAR_ERROR_TITLE}
    description={message}
    action={
      <KkButton loading={isRetrying} onClick={onRetry}>
        {CALENDAR_RETRY_LABEL}
      </KkButton>
    }
  />
);
