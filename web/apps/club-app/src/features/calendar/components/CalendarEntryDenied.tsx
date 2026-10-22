import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { CALENDAR_ORIGIN } from '@/features/session/app-sections';
import { AccessDenied } from '@/features/session/components/AccessDenied';

interface CalendarEntryDeniedProps {
  title: string;
  message: string;
}

export const CalendarEntryDenied: FC<CalendarEntryDeniedProps> = ({ title, message }) => (
  <KkScreen kind="fullscreen" title={title} origin={CALENDAR_ORIGIN}>
    <AccessDenied message={message} />
  </KkScreen>
);
