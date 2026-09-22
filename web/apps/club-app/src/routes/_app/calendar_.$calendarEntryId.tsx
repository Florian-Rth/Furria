import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarBoardSearchSchema, CalendarEntryScreen } from '@/features/calendar';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarEntryRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <CalendarEntryScreen />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/calendar_/$calendarEntryId')({
  component: CalendarEntryRoute,
  validateSearch: CalendarBoardSearchSchema,
});
