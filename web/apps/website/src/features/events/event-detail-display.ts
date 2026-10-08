import { sessionAt } from '@/lib/club';
import { formatClockTime, formatLongDate, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event, EventDetail, EventVenue } from '@/lib/public-events/schemas';

export type EventStatKind = 'date' | 'doors' | 'start' | 'price' | 'age';

export interface EventStat {
  kind: EventStatKind;
  value: string;
  label: string;
}

const EVENT_STAT_LABELS: Record<EventStatKind, string> = {
  date: 'Termin',
  doors: 'Einlass',
  start: 'Beginn',
  price: 'pro Karte',
  age: 'Alter',
};

const statOf = (kind: EventStatKind, value: string): EventStat => ({
  kind,
  value,
  label: EVENT_STAT_LABELS[kind],
});

export const deriveEventSessionLabel = (event: Pick<Event, 'startsAt'>): string =>
  sessionAt(parseBerlinDateTime(event.startsAt)).yearsLabel;

export const buildEventDocumentTitle = (event: Pick<Event, 'title' | 'startsAt'>): string =>
  `${event.title} ${deriveEventSessionLabel(event)}`;

export const deriveEventStats = (event: Event): EventStat[] => {
  const stats: EventStat[] = [statOf('date', formatLongDate(event.startsAt))];

  if (event.doorsOpenAt !== null) {
    stats.push(statOf('doors', `${formatClockTime(event.doorsOpenAt)} Uhr`));
  }
  stats.push(statOf('start', `${formatClockTime(event.startsAt)} Uhr`));

  if (event.priceCents !== null) {
    stats.push(statOf('price', formatEuros(event.priceCents)));
  }
  if (event.ageHint !== null) {
    stats.push(statOf('age', event.ageHint));
  }

  return stats;
};

export const deriveEventIntroParagraphs = (event: EventDetail): string[] =>
  event.description ?? [event.teaser];

export type VenueFactKind = 'address' | 'hint';

export interface VenueFact {
  kind: VenueFactKind;
  label: string;
  value: string;
}

const VENUE_FACT_LABELS: Record<VenueFactKind, string> = {
  address: 'ADRESSE',
  hint: 'HINWEIS',
};

const joinPresent = (parts: string[], separator: string): string =>
  parts.filter((part) => part.length > 0).join(separator);

export const deriveVenueFacts = (venue: EventVenue): VenueFact[] => {
  const address = joinPresent([venue.street, joinPresent([venue.zip, venue.city], ' ')], ', ');
  const facts: VenueFact[] = [];

  if (address.length > 0) {
    facts.push({ kind: 'address', label: VENUE_FACT_LABELS.address, value: address });
  }
  if (venue.hint !== null) {
    facts.push({ kind: 'hint', label: VENUE_FACT_LABELS.hint, value: venue.hint });
  }

  return facts;
};
