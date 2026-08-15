import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Event } from '@/lib/seed/events';

interface EventDetailHeadlineProps {
  event: Event;
}

export const EventDetailHeadline: FC<EventDetailHeadlineProps> = ({ event }) => (
  <Typography
    variant="h1"
    component="h1"
    sx={{ textTransform: 'uppercase', fontSize: 'clamp(2.75rem, 6vw, 4.75rem)' }}
  >
    {event.title}
  </Typography>
);
