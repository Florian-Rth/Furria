import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarEntryNewScreen } from '@/features/calendar/components/CalendarEntryNewScreen';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequirePerson } from '@/features/session/components/RequirePerson';

const CalendarEntryNewRoute: FC = () => (
  <RequirePerson title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <CalendarEntryNewScreen />
  </RequirePerson>
);

export const Route = createFileRoute('/_app/calendar_/new')({
  component: CalendarEntryNewRoute,
  validateSearch: CalendarSearchSchema,
});
