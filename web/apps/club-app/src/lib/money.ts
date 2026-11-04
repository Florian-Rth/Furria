const CENTS_PER_EURO = 100;
const EURO = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const TRAILING_SLASHES = /\/+$/;

export const formatEuroCents = (cents: number): string => EURO.format(cents / CENTS_PER_EURO);

export const payPalLinkOf = (link: string, cents: number): string =>
  `${link.replace(TRAILING_SLASHES, '')}/${(cents / CENTS_PER_EURO).toFixed(2)}EUR`;
