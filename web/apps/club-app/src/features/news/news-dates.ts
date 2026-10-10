const LONG_DATE = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const SHORT_DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const TIME = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export const longDateOf = (iso: string): string => LONG_DATE.format(new Date(iso));
export const shortDateOf = (iso: string): string => SHORT_DATE.format(new Date(iso));
export const timeOf = (iso: string): string => TIME.format(new Date(iso));
