const ZONE = 'Europe/Berlin';

const DAY = new Intl.DateTimeFormat('de-DE', { timeZone: ZONE, day: '2-digit', month: '2-digit' });
const TIME = new Intl.DateTimeFormat('de-DE', {
  timeZone: ZONE,
  hour: '2-digit',
  minute: '2-digit',
});
const WEEKDAY = new Intl.DateTimeFormat('de-DE', { timeZone: ZONE, weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('de-DE', { timeZone: ZONE, month: 'long', year: 'numeric' });
const MONTH_KEY = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONE,
  year: 'numeric',
  month: '2-digit',
});
const PACE = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const dayOf = (iso: string): string => DAY.format(new Date(iso));

export const timeOf = (iso: string): string => TIME.format(new Date(iso));

export const weekdayDayOf = (iso: string): string =>
  `${WEEKDAY.format(new Date(iso)).replace('.', '')} ${dayOf(iso)}`;

export const monthKeyOf = (iso: string): string => MONTH_KEY.format(new Date(iso)).slice(0, 7);

export const monthLabelOf = (iso: string): string => MONTH.format(new Date(iso));

export const paceLabelOf = (pacePerDay: number): string => PACE.format(pacePerDay);

export const signedOf = (count: number): string => (count > 0 ? `+${count}` : `−${-count}`);
