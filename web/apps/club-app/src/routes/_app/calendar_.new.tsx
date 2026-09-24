import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  CALENDAR_ORIGIN,
  CALENDAR_TITLE,
  CalendarBoardSearchSchema,
  CalendarEntryNewScreen,
} from '@/features/calendar';
import { RequireScreenPermission } from '@/features/session';
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
  validateSearch: CalendarBoardSearchSchema,
});
