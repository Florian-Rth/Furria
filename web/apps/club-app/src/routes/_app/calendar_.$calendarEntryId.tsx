import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarBoardSearchSchema, CalendarEntryScreen } from '@/features/calendar';
import { CALENDAR_ORIGIN, CALENDAR_TITLE, RequireScreenPermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarEntryRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={CALENDAR_TITLE}
    origin={CALENDAR_ORIGIN}
  >
    <CalendarEntryScreen />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/calendar_/$calendarEntryId')({
  component: CalendarEntryRoute,
  validateSearch: CalendarBoardSearchSchema,
});
