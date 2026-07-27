const GERMAN_LOCALE = 'de-DE';
const APP_TIME_ZONE = 'Europe/Berlin';

const longDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: APP_TIME_ZONE,
});

const shortDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  timeZone: APP_TIME_ZONE,
});

export const formatLongDate = (isoDate: string): string => longDateFormat.format(new Date(isoDate));

export const formatShortDate = (isoDate: string): string =>
  shortDateFormat.format(new Date(isoDate));
