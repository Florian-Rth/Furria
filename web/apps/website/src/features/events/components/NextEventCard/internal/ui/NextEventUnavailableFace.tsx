import type { FC } from 'react';
import { SalesStatusBadge } from '@/features/events/components/SalesStatusBadge';
import { nextEventUpcomingKicker } from '@/features/events/next-event-content';
import type { Event } from '@/lib/seed/events';
import { NextEventShell } from '../layout/NextEventShell';
import { NextEventDetailLink } from './NextEventDetailLink';
import { NextEventIntro } from './NextEventIntro';

interface NextEventUnavailableFaceProps {
  event: Event;
}

export const NextEventUnavailableFace: FC<NextEventUnavailableFaceProps> = ({ event }) => (
  <NextEventShell>
    <NextEventIntro kicker={nextEventUpcomingKicker} event={event} />
    <SalesStatusBadge event={event} />
    <NextEventDetailLink eventId={event.id} emphasis="outlined" />
  </NextEventShell>
);
