const CENTS_PER_EURO = 100;
const CENT_DIGITS = 2;
const NO_PRICE = '';

export const toWrittenPriceCents = (price: string): number => {
  const [euros = '0', cents = ''] = price.trim().replace(',', '.').split('.');

  return Number(euros) * CENTS_PER_EURO + Number(cents.padEnd(CENT_DIGITS, '0'));
};

export const toPriceCents = (price: string): number | null =>
  price.trim() === NO_PRICE ? null : toWrittenPriceCents(price);

export const toPriceText = (priceCents: number | null): string => {
  if (priceCents === null) {
    return NO_PRICE;
  }

  const euros = Math.floor(priceCents / CENTS_PER_EURO);
  const cents = String(priceCents % CENTS_PER_EURO).padStart(CENT_DIGITS, '0');

  return `${euros},${cents}`;
};
