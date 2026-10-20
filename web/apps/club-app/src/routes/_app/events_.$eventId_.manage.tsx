import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventManagePage } from '@/features/events';

const EventManageRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <EventManagePage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/events_/$eventId_/manage')({
  component: EventManageRoute,
});
