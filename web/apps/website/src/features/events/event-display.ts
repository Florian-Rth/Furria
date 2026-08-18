import {
  berlinDayNumber,
  formatClockTime,
  formatLongDateRange,
  formatWeekdayLong,
} from '@/lib/date';
import type { Event } from '@/lib/seed/events';

export const buildEventHref = (eventId: string): string => `/events/${eventId}`;

export const buildOrderFlowHref = (eventId: string): string => `${buildEventHref(eventId)}/order`;

export const buildOrderConfirmationHref = (orderCode: string): string => `/orders/${orderCode}`;

export const buildExchangeHref = (): string => '/events/exchange';

export const findEventBySlug = (events: Event[], slug: string): Event | undefined =>
  events.find((event) => event.id === slug);

export const selectEventsByDate = (events: Event[]): Event[] =>
  [...events].sort((first, second) => first.startsAt.localeCompare(second.startsAt));

export const selectOfferedEventsByDate = (events: Event[]): Event[] =>
  selectEventsByDate(events).filter((event) => event.salesStatus !== 'cancelled');

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

export const deriveTimesLabel = (event: Event): string =>
  event.doorsOpenAt !== null
    ? `Einlass ${formatClockTime(event.doorsOpenAt)} · Beginn ${formatClockTime(event.startsAt)} Uhr`
    : `Beginn ${formatClockTime(event.startsAt)} Uhr`;
