import { KkCard } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventDisplay } from '@/features/landing/events-teaser-content';
import type { Event } from '@/lib/public-events/schemas';
import { EventDateBlock } from './EventDateBlock';

interface EventRowProps {
  event: Event;
}

export const EventRow: FC<EventRowProps> = ({ event }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);

  return (
    <KkCard>
      <KkCard.Body>
        <Stack direction="row" sx={{ width: '100%', gap: 2, alignItems: 'center' }}>
          <EventDateBlock day={day} month={month} />
          <Stack sx={{ gap: 0.5, flex: 1, minWidth: 0 }}>
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
