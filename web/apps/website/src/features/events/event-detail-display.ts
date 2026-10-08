import { sessionAt } from '@/lib/club';
import { formatClockTime, formatLongDate, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event, EventDetail, EventVenue } from '@/lib/public-events/schemas';

export interface EventStat {
  value: string;
  label: string;
}

export const deriveEventSessionLabel = (event: Pick<Event, 'startsAt'>): string =>
  sessionAt(parseBerlinDateTime(event.startsAt)).yearsLabel;

export const buildEventDocumentTitle = (event: Pick<Event, 'title' | 'startsAt'>): string =>
  `${event.title} ${deriveEventSessionLabel(event)}`;

export const deriveEventStats = (event: Event): EventStat[] => {
  const stats: EventStat[] = [{ value: formatLongDate(event.startsAt), label: 'Termin' }];

  if (event.doorsOpenAt !== null) {
    stats.push({ value: `${formatClockTime(event.doorsOpenAt)} Uhr`, label: 'Einlass' });
  }
  stats.push({ value: `${formatClockTime(event.startsAt)} Uhr`, label: 'Beginn' });

  if (event.priceCents !== null) {
    stats.push({ value: formatEuros(event.priceCents), label: 'pro Karte' });
  }
  if (event.ageHint !== null) {
    stats.push({ value: event.ageHint, label: 'Alter' });
  }

  return stats;
};

export const deriveEventIntroParagraphs = (event: EventDetail): string[] =>
  event.description ?? [event.teaser];

export interface VenueFact {
  label: string;
  value: string;
}

const joinPresent = (parts: string[], separator: string): string =>
  parts.filter((part) => part.length > 0).join(separator);

export const deriveVenueFacts = (venue: EventVenue): VenueFact[] => {
  const address = joinPresent([venue.street, joinPresent([venue.zip, venue.city], ' ')], ', ');
  const facts: VenueFact[] = [];

  if (address.length > 0) {
    facts.push({ label: 'ADRESSE', value: address });
  }
  if (venue.hint !== null) {
    facts.push({ label: 'HINWEIS', value: venue.hint });
  }

  return facts;
};
