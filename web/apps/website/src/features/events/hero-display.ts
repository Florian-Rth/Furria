import { sessionAt } from '@/lib/club';
import { formatLongDate, parseBerlinDateTime } from '@/lib/date';
import { formatEuros } from '@/lib/money';
import type { Event } from '@/lib/seed/events';
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

export const deriveSessionEyebrow = (events: Event[], now: Date): string => {
  const earliest = selectOfferedEventsByDate(events).at(0);
  const sessionDate = earliest === undefined ? now : parseBerlinDateTime(earliest.startsAt);
  return `TERMINE & KARTEN · SESSION ${sessionAt(sessionDate).yearsLabel}`;
};

export const deriveHeroIntro = (events: Event[]): string | null => {
  const offered = selectOfferedEventsByDate(events);
  const first = offered.at(0);
  const last = offered.at(-1);
  if (first === undefined || last === undefined) {
    return null;
  }

  const venues = new Set(offered.map((event) => event.venue));
  const venueClause = venues.size === 1 ? ` im ${first.venue}` : '';

  if (offered.length === 1) {
    return `Ein Abend${venueClause}, am ${formatLongDate(first.startsAt)}.`;
  }
  return `${countWord(offered.length)} Abende${venueClause}, vom ${formatLongDate(first.startsAt)} bis zum ${formatLongDate(last.startsAt)}.`;
};

export const deriveHeroStats = (events: Event[]): HeroStat[] => {
  const offered = selectOfferedEventsByDate(events);
  if (offered.length === 0) {
    return [];
  }

  const stats: HeroStat[] = [
    { value: String(offered.length), label: offered.length === 1 ? 'Abend' : 'Abende' },
  ];

  const knownPrices = offered
    .map((event) => event.priceCents)
    .filter((price): price is number => price !== null);
  if (knownPrices.length > 0) {
    stats.push({ value: `ab ${formatEuros(Math.min(...knownPrices))}`, label: 'pro Karte' });
  }

  const knownFreeCounts = offered
    .map((event) => event.freeCount)
    .filter((count): count is number => count !== null);
  if (knownFreeCounts.length > 0) {
    const freeTotal = knownFreeCounts.reduce((sum, count) => sum + count, 0);
    stats.push({ value: String(freeTotal), label: 'Karten noch frei' });
  }

  return stats;
};
