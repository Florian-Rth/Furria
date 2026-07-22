import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveEventDisplay, type ProgramEvent } from '@/features/landing/program-content';

interface ProgramCardProps {
  event: ProgramEvent;
  tint: string;
}

export const ProgramCard: FC<ProgramCardProps> = ({ event, tint }) => {
  const { day, month, time } = deriveEventDisplay(event.startsAt);

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <KkPhotoPlaceholder
        label="event-foto"
        tint={tint}
        aspectRatio={kkTokens.aspectRatio.banner}
      />
      <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start', p: 2.5 }}>
        <Stack sx={{ textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
          <Typography variant="h3" component="span" sx={{ color: tint, lineHeight: 0.9 }}>
            {day}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
          >
            {month}
          </Typography>
        </Stack>
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800 }}>
            {event.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {event.venue} · {time}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
