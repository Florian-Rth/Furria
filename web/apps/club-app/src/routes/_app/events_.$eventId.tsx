import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventPage, EventSearchSchema } from '@/features/events';

const EventRoute: FC = () => {
  const { eventId } = Route.useParams();

  return <EventPage eventId={eventId} />;
};

export const Route = createFileRoute('/_app/events_/$eventId')({
  validateSearch: EventSearchSchema,
  component: EventRoute,
});
