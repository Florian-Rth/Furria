import type { NewsEventTie } from './schemas';

const DAY = new Intl.DateTimeFormat('de-DE', { day: '2-digit' });
const MONTH = new Intl.DateTimeFormat('de-DE', { month: 'short' });
const DATE = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});
const DATE_WITH_YEAR = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const CLOCK = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const YEAR = new Intl.DateTimeFormat('de-DE', { year: 'numeric' });

export interface EventTieLines {
  day: string;
  month: string;
  line: string;
}

export const eventTieLinesOf = (
  event: NewsEventTie,
  cancelledWord: string,
  today: Date,
): EventTieLines => {
  const startsAt = new Date(event.startsAt);
  const isThisYear = YEAR.format(startsAt) === YEAR.format(today);
  const facts = [
    (isThisYear ? DATE : DATE_WITH_YEAR).format(startsAt),
    `${CLOCK.format(startsAt)} Uhr`,
    event.venueName,
    event.isCancelled ? cancelledWord : null,
  ].filter((fact) => fact !== null);
  return {
    day: DAY.format(startsAt),
    month: MONTH.format(startsAt).replace('.', '').toUpperCase(),
    line: facts.join(' · '),
  };
};

export const albumTieLineOf = (photoCount: number, photosWord: string): string =>
  `${photoCount} ${photosWord}`;
