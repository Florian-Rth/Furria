import type { LabBeerPerson } from '@/features/lab-beer/beer-lab-types';

const ZONE = 'Europe/Berlin';

const WEEKDAY = new Intl.DateTimeFormat('de-DE', { weekday: 'short', timeZone: ZONE });
const DAY_MONTH = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  timeZone: ZONE,
});
const PACE = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const shortDayOf = (iso: string): string => DAY_MONTH.format(new Date(iso));

export const dayOf = (iso: string): string =>
  `${WEEKDAY.format(new Date(iso)).replace('.', '')} ${shortDayOf(iso)}`;

export const paceOfDay = (pacePerDay: number): string => PACE.format(pacePerDay);

export const nameOf = (person: LabBeerPerson | null): string =>
  person === null ? '' : `${person.firstName} ${person.lastName}`;
