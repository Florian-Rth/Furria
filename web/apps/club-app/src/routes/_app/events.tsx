import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventsPage } from '@/features/events';
import {
  EVENTS_KEYS,
  EVENTS_TITLE,
  MORE_SECTION,
  RequireAnyScreenPermission,
} from '@/features/session';

const EventsRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={EVENTS_KEYS}
    title={EVENTS_TITLE}
    section={MORE_SECTION}
  >
    <EventsPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/events')({ component: EventsRoute });
