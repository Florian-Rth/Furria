import { createFileRoute } from '@tanstack/react-router';
import { EventPage } from '@/features/events';

export const Route = createFileRoute('/_app/events_/$eventId')({ component: EventPage });
