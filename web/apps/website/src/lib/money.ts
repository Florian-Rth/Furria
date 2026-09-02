const GERMAN_LOCALE = 'de-DE';
const CENTS_PER_EURO = 100;

const euroFormat = new Intl.NumberFormat(GERMAN_LOCALE, {
  style: 'currency',
  currency: 'EUR',
  trailingZeroDisplay: 'stripIfInteger',
});

export const formatEuros = (cents: number): string => euroFormat.format(cents / CENTS_PER_EURO);
