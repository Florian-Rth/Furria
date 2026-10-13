import { eventToneOf, KkEventPicture, kkTokens, toImageSource } from '@furria/ui';
import type { FC } from 'react';
import { eventCancelledStamp } from '@/features/events/event-detail-content';
import type { EventDetail } from '@/lib/public-events/schemas';

const EVENT_PICTURE_SIZES = '(min-width: 1536px) 860px, (min-width: 900px) 58vw, 100vw';

interface EventDetailPictureProps {
  event: EventDetail;
}

export const EventDetailPicture: FC<EventDetailPictureProps> = ({ event }) => {
  const image = toImageSource(event.picture, 'banner', EVENT_PICTURE_SIZES);
  const tone = eventToneOf(event.eventId);
  const cancelledLabel = event.status === 'cancelled' ? eventCancelledStamp : null;

  return (
    <KkEventPicture
      image={image}
      tone={tone}
      cancelledLabel={cancelledLabel}
      scale="band"
      priority
      sx={{
        height: 'auto',
        aspectRatio: kkTokens.aspectRatio.banner,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
      }}
    />
  );
};
