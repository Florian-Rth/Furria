import { KkPanelStack } from '@furria/ui';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { EventDetails } from '../schemas';
import { EventCancellationLine } from './EventCancellationLine';
import { EventDeletionLine } from './EventDeletionLine';
import { EventFactsPanel } from './EventFactsPanel';
import { EventRequestsPanel } from './EventRequestsPanel';
import { EventTicketsPanel } from './EventTicketsPanel';

interface EventViewProps {
  event: EventDetails;
}

export const EventView: FC<EventViewProps> = ({ event }) => {
  const { highlightedKey } = useLanding();
  const { handlesRequests } = useEventsWorkbench();

  const requests = handlesRequests ? <EventRequestsPanel eventId={event.eventId} /> : null;

  return (
    <KkPanelStack>
      <EventFactsPanel event={event} highlightedKey={highlightedKey} />
      <EventTicketsPanel event={event} />
      {requests}
      <EventCancellationLine event={event} />
      <EventDeletionLine event={event} />
    </KkPanelStack>
  );
};
