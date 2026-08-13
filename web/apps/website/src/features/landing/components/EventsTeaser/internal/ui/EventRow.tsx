import { KkCard } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventDisplay } from '@/features/landing/events-teaser-content';
import type { Event } from '@/lib/seed/events';
import { EventDateBlock } from './EventDateBlock';

interface EventRowProps {
  event: Event;
  tint: string;
}

export const EventRow: FC<EventRowProps> = ({ event, tint }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);

  return (
    <KkCard>
      <KkCard.Body>
        <Stack direction="row" sx={{ width: '100%', gap: 2, alignItems: 'center' }}>
          <EventDateBlock day={day} month={month} />
          <Stack sx={{ gap: 0.5, flex: 1, minWidth: 0 }}>
            <KkCard.Title>{event.title}</KkCard.Title>
            <KkCard.Text>
              {event.venue} · {time}
            </KkCard.Text>
          </Stack>
          <Box
            data-kk-event-dot
            aria-hidden
            sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: tint, flexShrink: 0 }}
          />
        </Stack>
      </KkCard.Body>
    </KkCard>
  );
};
