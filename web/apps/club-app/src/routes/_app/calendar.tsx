import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_SECTION, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={CALENDAR_TITLE}
    section={CALENDAR_SECTION}
  >
    <CalendarPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/calendar')({
  component: CalendarRoute,
  validateSearch: CalendarSearchSchema,
});
