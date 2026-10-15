import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '@/features/session';
import { CalendarError } from './CalendarError';

interface CalendarEntryErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const CalendarEntryError: FC<CalendarEntryErrorProps> = ({
  message,
  isRetrying,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <CalendarError message={message} isRetrying={isRetrying} onRetry={onRetry} />
  </KkScreen>
);
