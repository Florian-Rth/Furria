import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarBoardSearchSchema, CalendarPage } from '@/features/calendar';
import { CALENDAR_SECTION, CALENDAR_TITLE, RequireScreenPermission } from '@/features/session';
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
  validateSearch: CalendarBoardSearchSchema,
});
