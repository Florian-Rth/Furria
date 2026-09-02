import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  nextEventAnnouncedNote,
  nextEventUpcomingKicker,
} from '@/features/events/next-event-content';
import type { Event } from '@/lib/seed/events';
import { NextEventShell } from '../layout/NextEventShell';
import { NextEventDetailLink } from './NextEventDetailLink';
import { NextEventIntro } from './NextEventIntro';

interface NextEventAnnouncedFaceProps {
  event: Event;
}

export const NextEventAnnouncedFace: FC<NextEventAnnouncedFaceProps> = ({ event }) => (
  <NextEventShell>
    <NextEventIntro kicker={nextEventUpcomingKicker} event={event} />
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {nextEventAnnouncedNote}
    </Typography>
    <NextEventDetailLink eventId={event.id} emphasis="outlined" />
  </NextEventShell>
);
