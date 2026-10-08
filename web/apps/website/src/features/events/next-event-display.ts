import { parseBerlinDateTime } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';
import { selectOfferedEventsByDate } from './event-display';

export type NextEventFace =
  | { kind: 'tickets' }
  | { kind: 'presale'; presaleStartsAt: string }
  | { kind: 'announced' }
  | { kind: 'unavailable' };

const TICKET_STATUSES: readonly SalesStatus[] = ['available', 'fewLeft'];

export const selectNextEvent = (events: Event[], now: Date): Event | null => {
  const upcoming = selectOfferedEventsByDate(events).filter(
    (event) => parseBerlinDateTime(event.startsAt).getTime() >= now.getTime(),
  );
  const nextWithTickets = upcoming.find((event) => TICKET_STATUSES.includes(event.status));
  return nextWithTickets ?? upcoming.at(0) ?? null;
};

export const deriveNextEventFace = (event: Event): NextEventFace => {
  switch (event.status) {
    case 'available':
    case 'fewLeft':
      return { kind: 'tickets' };
    case 'presaleScheduled':
      return event.presaleStartsAt === null
        ? { kind: 'announced' }
        : { kind: 'presale', presaleStartsAt: event.presaleStartsAt };
    case 'announced':
      return { kind: 'announced' };
    case 'soldOut':
    case 'cancelled':
      return { kind: 'unavailable' };
  }
};
