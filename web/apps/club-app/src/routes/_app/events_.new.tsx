import { createFileRoute } from '@tanstack/react-router';
import { EventNewScreen } from '@/features/events/components/EventNewScreen';

export const Route = createFileRoute('/_app/events_/new')({ component: EventNewScreen });
