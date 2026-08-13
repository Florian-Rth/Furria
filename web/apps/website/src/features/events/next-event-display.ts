import { parseBerlinDateTime } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/seed/events';
import { selectOfferedEventsByDate } from './event-display';

export type NextEventFace =
  | { kind: 'tickets' }
  | { kind: 'presale'; presaleStartsAt: string }
  | { kind: 'announced' }
  | { kind: 'unavailable' };

const TICKET_SALE_STATUSES: readonly SalesStatus[] = ['onSale', 'almostSoldOut'];

export const selectNextEvent = (events: Event[], now: Date): Event | null => {
  const upcoming = selectOfferedEventsByDate(events).filter(
    (event) => parseBerlinDateTime(event.startsAt).getTime() >= now.getTime(),
  );
  const nextOnSale = upcoming.find((event) => TICKET_SALE_STATUSES.includes(event.salesStatus));
  return nextOnSale ?? upcoming.at(0) ?? null;
};

export const deriveNextEventFace = (event: Event): NextEventFace => {
  switch (event.salesStatus) {
    case 'onSale':
    case 'almostSoldOut':
      return { kind: 'tickets' };
    case 'presaleScheduled':
      return event.presaleStartsAt === null
        ? { kind: 'announced' }
        : { kind: 'presale', presaleStartsAt: event.presaleStartsAt };
    case 'announced':
      return { kind: 'announced' };
    case 'soldOut':
    case 'salesClosed':
    case 'cancelled':
      return { kind: 'unavailable' };
  }
};
