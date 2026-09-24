import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { CALENDAR_ORIGIN } from '../calendar-labels';

interface CalendarEntryDeniedProps {
  title: string;
  message: string;
}

export const CalendarEntryDenied: FC<CalendarEntryDeniedProps> = ({ title, message }) => (
  <KkScreen kind="fullscreen" title={title} origin={CALENDAR_ORIGIN}>
    <AccessDenied message={message} />
  </KkScreen>
);
