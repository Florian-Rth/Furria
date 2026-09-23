import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '../calendar-labels';
import { CalendarError } from './CalendarError';

interface CalendarEntryErrorProps {
  message: string;
  onRetry: () => void;
}

export const CalendarEntryError: FC<CalendarEntryErrorProps> = ({ message, onRetry }) => (
  <KkScreen kind="fullscreen" title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <CalendarError message={message} onRetry={onRetry} />
  </KkScreen>
);
