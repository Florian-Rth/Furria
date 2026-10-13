import { aspectRatioCss, eventToneOf, KkPhoto, toImageSource } from '@furria/ui';
import type { FC } from 'react';
import { eventCancelledStamp } from '@/features/events/event-detail-content';
import type { EventDetail } from '@/lib/public-events/schemas';

const EVENT_PICTURE_SIZES = '(min-width: 1536px) 860px, (min-width: 900px) 58vw, 100vw';
const EVENT_PICTURE_ASPECT_RATIO = aspectRatioCss('banner');
const PICTURE_EDGE = { border: 1, borderColor: 'divider' } as const;

interface EventDetailPictureProps {
  event: EventDetail;
}

export const EventDetailPicture: FC<EventDetailPictureProps> = ({ event }) => {
  const image = toImageSource(event.picture, 'banner', EVENT_PICTURE_SIZES);
  const tone = eventToneOf(event.eventId);
  const cancelledLabel = event.status === 'cancelled' ? eventCancelledStamp : null;

  return (
    <KkPhoto
      alt=""
      image={image}
      aspectRatio={EVENT_PICTURE_ASPECT_RATIO}
      tone={tone}
      stampLabel={cancelledLabel}
      stampScale="band"
      priority
      sx={PICTURE_EDGE}
    />
  );
};
