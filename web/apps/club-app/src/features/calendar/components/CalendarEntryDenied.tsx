import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied, CALENDAR_ORIGIN } from '@/features/session';

interface CalendarEntryDeniedProps {
  title: string;
  message: string;
}

export const CalendarEntryDenied: FC<CalendarEntryDeniedProps> = ({ title, message }) => (
  <KkScreen kind="fullscreen" title={title} origin={CALENDAR_ORIGIN}>
    <AccessDenied message={message} />
  </KkScreen>
);
