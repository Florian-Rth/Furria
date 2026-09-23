import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CALENDAR_TITLE, CalendarBoardSearchSchema, CalendarPage } from '@/features/calendar';
import { CLUB_ORIGIN, RequireScreenPermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={CALENDAR_TITLE}
    origin={CLUB_ORIGIN}
  >
    <CalendarPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/calendar')({
  component: CalendarRoute,
  validateSearch: CalendarBoardSearchSchema,
});
