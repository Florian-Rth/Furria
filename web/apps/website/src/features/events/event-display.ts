import {
  berlinDayNumber,
  formatClockTime,
  formatLongDateRange,
  formatWeekdayLong,
} from '@/lib/date';
import { buildEventSlug } from '@/lib/public-events/event-slug';
import type { Event } from '@/lib/public-events/schemas';

export interface EventAddress {
  eventId: number;
  title: string;
}

export const buildEventHref = ({ eventId, title }: EventAddress): string =>
  `/events/${buildEventSlug(eventId, title)}`;

export const buildTicketRequestHref = (address: EventAddress): string =>
  `${buildEventHref(address)}/anfrage`;

export const buildEventAnchorId = (eventId: number): string => `event-${eventId}`;

export const selectEventsByDate = <TEvent extends Event>(events: TEvent[]): TEvent[] =>
  [...events].sort((first, second) => first.startsAt.localeCompare(second.startsAt));

export const selectOfferedEventsByDate = (events: Event[]): Event[] =>
  selectEventsByDate(events).filter((event) => event.status !== 'cancelled');

export const deriveScheduleRangeLabel = (events: Event[]): string | null => {
  const ordered = selectEventsByDate(events);
  const first = ordered.at(0);
  const last = ordered.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }
  return formatLongDateRange(first.startsAt, last.startsAt);
};

const PROXIMITY_WINDOW_DAYS = 7;

export const deriveProximityLabel = (startsAt: string, now: Date): string | null => {
  const daysAhead = berlinDayNumber(startsAt) - berlinDayNumber(now);
  if (daysAhead === 0) {
    return 'Heute';
  }
  if (daysAhead === 1) {
    return 'Morgen';
  }
  if (daysAhead > 1 && daysAhead < PROXIMITY_WINDOW_DAYS) {
    return `Diesen ${formatWeekdayLong(startsAt)}`;
  }
  return null;
};

export const deriveTimesLabel = (event: Pick<Event, 'startsAt' | 'doorsOpenAt'>): string =>
  event.doorsOpenAt !== null
    ? `Einlass ${formatClockTime(event.doorsOpenAt)} · Beginn ${formatClockTime(event.startsAt)} Uhr`
    : `Beginn ${formatClockTime(event.startsAt)} Uhr`;
