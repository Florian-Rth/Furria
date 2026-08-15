import { sessionAt } from '@/lib/club';
import { formatClockTime, formatLongDate, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';
import { selectOfferedEventsByDate } from './event-display';

export interface EventStat {
  value: string;
  label: string;
}

export const deriveEventSessionLabel = (event: Event): string =>
  sessionAt(parseBerlinDateTime(event.startsAt)).yearsLabel;

export const buildEventDocumentTitle = (event: Event): string =>
  `${event.title} ${deriveEventSessionLabel(event)}`;

export const deriveEventTags = (event: Event): string[] => {
  const tags = [event.type, `Session ${deriveEventSessionLabel(event)}`];
  if (event.ageHint !== null) {
    tags.push(event.ageHint);
  }
  tags.push(event.venue);
  return tags;
};

export const deriveEventStats = (event: Event): EventStat[] => {
  const stats: EventStat[] = [{ value: formatLongDate(event.startsAt), label: 'Termin' }];

  if (event.doorsOpenAt !== null) {
    stats.push({ value: `${formatClockTime(event.doorsOpenAt)} Uhr`, label: 'Einlass' });
  }
  stats.push({ value: `${formatClockTime(event.startsAt)} Uhr`, label: 'Beginn' });

  if (event.priceCents !== null) {
    stats.push({ value: formatEuros(event.priceCents), label: 'pro Karte' });
  }

  return stats;
};

export const OTHER_EVENTS_LIMIT = 3;

export const selectOtherEventsInSession = (events: Event[], current: Event, now: Date): Event[] =>
  selectOfferedEventsByDate(events)
    .filter(
      (event) =>
        event.id !== current.id && parseBerlinDateTime(event.startsAt).getTime() >= now.getTime(),
    )
    .slice(0, OTHER_EVENTS_LIMIT);

export interface LineupAct {
  position: string;
  act: string;
}

export const deriveEventLineup = (event: Event): LineupAct[] | null =>
  event.performers === null
    ? null
    : event.performers.map((act, index) => ({ position: String(index + 1), act }));

export const deriveEventIntroParagraphs = (event: Event): string[] =>
  event.description ?? [event.teaser];
