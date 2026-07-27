import { KkCard, KkPhotoPlaceholder } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { deriveEventDisplay, type ProgramEvent } from '@/features/landing/program-content';
import { EventDateBlock } from './EventDateBlock';

interface ProgramCardProps {
  event: ProgramEvent;
  tint: string;
}

export const ProgramCard: FC<ProgramCardProps> = ({ event, tint }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);

  return (
    <KkCard>
      <KkCard.Media>
        <KkPhotoPlaceholder label="event-foto" tint={tint} fill />
      </KkCard.Media>
      <KkCard.Body>
        <Stack direction="row" sx={{ width: '100%', gap: 2, alignItems: 'flex-start' }}>
          <EventDateBlock day={day} month={month} />
          <Stack sx={{ gap: 0.5, minWidth: 0 }}>
            <KkCard.Title>{event.title}</KkCard.Title>
            <KkCard.Text>
              {event.venue} · {time}
            </KkCard.Text>
          </Stack>
        </Stack>
      </KkCard.Body>
    </KkCard>
  );
};
