import type { FC } from 'react';
import { deriveNextEventFace, selectNextEvent } from '@/features/events/next-event-display';
import type { Event } from '@/lib/seed/events';
import { NextEventAnnouncedFace } from './internal/ui/NextEventAnnouncedFace';
import { NextEventPresaleFace } from './internal/ui/NextEventPresaleFace';
import { NextEventTicketsFace } from './internal/ui/NextEventTicketsFace';
import { NextEventUnavailableFace } from './internal/ui/NextEventUnavailableFace';

interface NextEventCardProps {
  events: Event[];
  now: Date;
}

export const NextEventCard: FC<NextEventCardProps> = ({ events, now }) => {
  const nextEvent = selectNextEvent(events, now);
  if (nextEvent === null) {
    return null;
  }

  const face = deriveNextEventFace(nextEvent);
  if (face.kind === 'tickets') {
    return <NextEventTicketsFace event={nextEvent} />;
  }
  if (face.kind === 'presale') {
    return <NextEventPresaleFace event={nextEvent} presaleStartsAt={face.presaleStartsAt} />;
  }
  if (face.kind === 'announced') {
    return <NextEventAnnouncedFace event={nextEvent} />;
  }
  return <NextEventUnavailableFace event={nextEvent} />;
};
