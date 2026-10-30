import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { CalendarSearchSchema } from '@/features/calendar/schemas';
import { CALENDAR_SECTION, CALENDAR_TITLE } from '@/features/session/app-sections';
import { RequirePerson } from '@/features/session/components/RequirePerson';

const CalendarRoute: FC = () => (
  <RequirePerson title={CALENDAR_TITLE} section={CALENDAR_SECTION}>
    <CalendarPage />
  </RequirePerson>
);

export const Route = createFileRoute('/_app/calendar')({
  component: CalendarRoute,
  validateSearch: CalendarSearchSchema,
});
