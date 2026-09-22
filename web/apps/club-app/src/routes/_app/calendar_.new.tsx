import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarBoardSearchSchema, CalendarEntryNewScreen } from '@/features/calendar';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const CalendarEntryNewRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <CalendarEntryNewScreen />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/calendar_/new')({
  component: CalendarEntryNewRoute,
  validateSearch: CalendarBoardSearchSchema,
});
