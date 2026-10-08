import { createFileRoute } from '@tanstack/react-router';
import { EventEditScreen } from '@/features/events';

export const Route = createFileRoute('/_app/events_/$eventId_/edit')({
  component: EventEditScreen,
});
