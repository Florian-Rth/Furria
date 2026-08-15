import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveEventIntroParagraphs } from '@/features/events/event-detail-display';
import type { Event } from '@/lib/seed/events';

interface EventDetailIntroProps {
  event: Event;
}

export const EventDetailIntro: FC<EventDetailIntroProps> = ({ event }) => {
  const paragraphs = deriveEventIntroParagraphs(event);

  return (
    <Stack sx={{ gap: 1.5, maxWidth: '40rem' }}>
      {paragraphs.map((paragraph) => (
        <Typography
          key={paragraph}
          variant="body1"
          sx={{ color: 'text.secondary', lineHeight: 1.72, textWrap: 'pretty' }}
        >
          {paragraph}
        </Typography>
      ))}
    </Stack>
  );
};
