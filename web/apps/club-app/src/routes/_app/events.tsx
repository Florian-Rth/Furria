import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventsPage } from '@/features/events/components/EventsPage';
import { EventsSearchSchema } from '@/features/events/schemas';
import { EVENTS_KEYS, EVENTS_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

const EventsRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={EVENTS_KEYS}
    title={EVENTS_TITLE}
    section={MORE_SECTION}
  >
    <EventsPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/events')({
  validateSearch: EventsSearchSchema,
  component: EventsRoute,
});
