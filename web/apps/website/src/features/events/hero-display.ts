import { sessionAt } from '@/lib/club';
import { formatLongDate, formatLongDateRange, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/public-events/schemas';
import { selectOfferedEventsByDate } from './event-display';

export interface HeroStat {
  value: string;
  label: string;
}

const COUNT_WORDS = [
  'Kein',
  'Ein',
  'Zwei',
  'Drei',
  'Vier',
  'Fünf',
  'Sechs',
  'Sieben',
  'Acht',
  'Neun',
  'Zehn',
  'Elf',
  'Zwölf',
] as const;

const countWord = (count: number): string => COUNT_WORDS[count] ?? String(count);

export interface HeroFacts {
  eveningCount: number;
  sharedVenueName: string | null;
  firstStartsAt: string;
  lastStartsAt: string;
  cheapestPriceCents: number | null;
}

export const deriveHeroSessionLabel = (events: Event[], now: Date): string => {
  const earliest = selectOfferedEventsByDate(events).at(0);
  const sessionDate = earliest === undefined ? now : parseBerlinDateTime(earliest.startsAt);
  return sessionAt(sessionDate).yearsLabel;
};

export const deriveSessionEyebrow = (events: Event[], now: Date): string =>
  `TERMINE & KARTEN · SESSION ${deriveHeroSessionLabel(events, now)}`;

export const deriveHeroFacts = (events: Event[]): HeroFacts | null => {
  const offered = selectOfferedEventsByDate(events);
  const first = offered.at(0);
  const last = offered.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }

  const venues = new Set(offered.map((event) => event.venue.name));
  const knownPrices = offered
    .map((event) => event.priceCents)
    .filter((price): price is number => price !== null);

  return {
    eveningCount: offered.length,
    sharedVenueName: venues.size === 1 ? first.venue.name : null,
    firstStartsAt: first.startsAt,
    lastStartsAt: last.startsAt,
    cheapestPriceCents: knownPrices.length > 0 ? Math.min(...knownPrices) : null,
  };
};

export const deriveHeroIntro = (events: Event[]): string | null => {
  const facts = deriveHeroFacts(events);
  if (facts === null) {
    return null;
  }

  const when =
    facts.eveningCount === 1
      ? `Ein Abend am ${formatLongDate(facts.firstStartsAt)}.`
      : `${countWord(facts.eveningCount)} Abende, ${formatLongDateRange(facts.firstStartsAt, facts.lastStartsAt)}.`;

  return facts.sharedVenueName === null
    ? when
    : `${when} Veranstaltungsort: ${facts.sharedVenueName}.`;
};

export const deriveHeroStats = (events: Event[]): HeroStat[] => {
  const facts = deriveHeroFacts(events);
  if (facts === null) {
    return [];
  }

  const stats: HeroStat[] = [
    { value: String(facts.eveningCount), label: facts.eveningCount === 1 ? 'Abend' : 'Abende' },
  ];

  if (facts.cheapestPriceCents !== null) {
    stats.push({ value: `ab ${formatEuros(facts.cheapestPriceCents)}`, label: 'pro Karte' });
  }

  return stats;
};
