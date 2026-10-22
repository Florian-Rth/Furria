import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarEntryNewScreen } from '@/features/calendar/components/CalendarEntryNewScreen';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarEntryNewRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={CALENDAR_TITLE}
    origin={CALENDAR_ORIGIN}
  >
    <CalendarEntryNewScreen />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/calendar_/new')({
  component: CalendarEntryNewRoute,
  validateSearch: CalendarSearchSchema,
});
