import { eventToneOf } from '@furria/ui/group-tone';
import { toImageSource } from '@furria/ui/image-source';
import { KkCard } from '@furria/ui/KkCard';
import { KkPhoto } from '@furria/ui/KkPhoto';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventDisplay } from '@/features/landing/events-teaser-content';
import type { Event } from '@/lib/public-events/schemas';
import { EventDateBlock } from './EventDateBlock';

const EVENT_CARD_PICTURE_SIZES = '(min-width: 1536px) 480px, (min-width: 900px) 33vw, 100vw';

interface EventCardProps {
  event: Event;
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);
  const image = toImageSource(event.picture, 'banner', EVENT_CARD_PICTURE_SIZES);
  const tone = eventToneOf(event.eventId);

  return (
    <KkCard>
      <KkCard.Media>
        <KkPhoto alt="" image={image} tone={tone} fill />
      </KkCard.Media>
      <KkCard.Body>
        <Stack direction="row" sx={{ width: '100%', gap: 2, alignItems: 'flex-start' }}>
          <EventDateBlock day={day} month={month} />
          <Stack sx={{ gap: 0.5, minWidth: 0 }}>
            <KkCard.Title>{event.title}</KkCard.Title>
            <KkCard.Text>
              {event.venue.name} · {time}
            </KkCard.Text>
          </Stack>
        </Stack>
      </KkCard.Body>
    </KkCard>
  );
};
