import { sessionAt } from '@/lib/club';
import { formatClockTime, formatLongDate, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';

export interface EventStat {
  value: string;
  label: string;
}

export const deriveEventSessionLabel = (event: Event): string =>
  sessionAt(parseBerlinDateTime(event.startsAt)).yearsLabel;

export const buildEventDocumentTitle = (event: Event): string =>
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

  return stats;
};

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
