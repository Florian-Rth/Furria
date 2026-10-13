import { aspectRatioCss, eventToneOf, KkPanelStack, KkPhoto, toImageSource } from '@furria/ui';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { EventDetails } from '../schemas';
import { EventCancellationLine } from './EventCancellationLine';
import { EventDeletionLine } from './EventDeletionLine';
import { EventFactsPanel } from './EventFactsPanel';
import { EventRequestsPanel } from './EventRequestsPanel';
import { EventTicketsPanel } from './EventTicketsPanel';

const PICTURE_SIZES = '(min-width: 900px) 48rem, 100vw';
const PICTURE_ASPECT_RATIO = aspectRatioCss('banner');
const NO_PICTURE_LABEL = 'Kein Bild';

interface EventViewProps {
  event: EventDetails;
}

export const EventView: FC<EventViewProps> = ({ event }) => {
  const { highlightedKey } = useLanding();
  const { handlesRequests } = useEventsWorkbench();

  const image = toImageSource(event.picture?.picture ?? null, 'banner', PICTURE_SIZES);
  const tone = eventToneOf(event.eventId);
  const requests = handlesRequests ? <EventRequestsPanel eventId={event.eventId} /> : null;

  return (
    <KkPanelStack>
      <KkPhoto
        alt={event.title}
        orientation="landscape"
        aspectRatio={PICTURE_ASPECT_RATIO}
        placeholderLabel={NO_PICTURE_LABEL}
        image={image}
        tone={tone}
      />
      <EventFactsPanel event={event} highlightedKey={highlightedKey} />
      <EventTicketsPanel event={event} />
      {requests}
      <EventCancellationLine event={event} />
      <EventDeletionLine event={event} />
    </KkPanelStack>
  );
};
