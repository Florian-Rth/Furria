import type { BeerListPerson } from './schemas';

const ZONE = 'Europe/Berlin';

const WEEKDAY = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: ZONE });
const DAY_MONTH = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: ZONE,
});

export const shortDayOf = (iso: string): string => DAY_MONTH.format(new Date(iso));

export const weekdayDayOf = (iso: string): string =>
  `${WEEKDAY.format(new Date(iso)).replace('.', '')} ${shortDayOf(iso)}`;

export const personNameOf = (person: BeerListPerson | null): string | null =>
  person === null ? null : `${person.firstName} ${person.lastName}`;
