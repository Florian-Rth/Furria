import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarEntryScreen } from '@/features/calendar/components/CalendarEntryScreen';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_ORIGIN, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequirePerson } from '@/features/session/components/RequirePerson';

const CalendarEntryRoute: FC = () => (
  <RequirePerson title={CALENDAR_TITLE} origin={CALENDAR_ORIGIN}>
    <CalendarEntryScreen />
  </RequirePerson>
);

export const Route = createFileRoute('/_app/calendar_/$calendarEntryId')({
  component: CalendarEntryRoute,
  validateSearch: CalendarSearchSchema,
});
