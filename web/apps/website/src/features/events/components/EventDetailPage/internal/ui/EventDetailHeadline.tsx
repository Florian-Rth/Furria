import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Event } from '@/lib/seed/events';

interface EventDetailHeadlineProps {
  event: Event;
}

export const EventDetailHeadline: FC<EventDetailHeadlineProps> = ({ event }) => (
  <Typography variant="display" component="h1" sx={{ textTransform: 'uppercase' }}>
    {event.title}
  </Typography>
);
