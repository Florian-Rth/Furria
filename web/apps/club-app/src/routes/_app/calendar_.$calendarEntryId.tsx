import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarEntryScreen } from '@/features/calendar/components/CalendarEntryScreen';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
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
  validateSearch: CalendarSearchSchema,
});
