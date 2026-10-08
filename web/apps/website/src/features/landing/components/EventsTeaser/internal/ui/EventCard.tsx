import { KkCard, KkPhotoPlaceholder } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventDisplay } from '@/features/landing/events-teaser-content';
import type { Event } from '@/lib/public-events/schemas';
import { EventDateBlock } from './EventDateBlock';

interface EventCardProps {
  event: Event;
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);

  return (
    <KkCard>
      <KkCard.Media>
        <KkPhotoPlaceholder label="event-foto" fill />
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
