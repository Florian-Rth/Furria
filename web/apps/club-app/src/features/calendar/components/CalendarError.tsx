import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_ERROR_TITLE, CALENDAR_RETRY_LABEL } from '../calendar-labels';

interface CalendarErrorProps {
  message: string;
  onRetry: () => void;
}

export const CalendarError: FC<CalendarErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={CALENDAR_ERROR_TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{CALENDAR_RETRY_LABEL}</KkButton>}
  />
);
