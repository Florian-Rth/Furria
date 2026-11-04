import type { LabBeerOutcome } from '@/features/lab-beer/beer-lab-actions';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';

export interface PotSettings {
  priceCents: number;
  paymentLink: string | null;
  paymentNote: string | null;
}

const PRICE_PATTERN = /^\d{1,3}(?:[,.]\d{1,2})?$/;

export const centsOfPrice = (input: string): number | null => {
  const trimmed = input.trim().replace(/\s*€$/, '');

  if (!PRICE_PATTERN.test(trimmed)) {
    return null;
  }

  const cents = Math.round(Number(trimmed.replace(',', '.')) * 100);

  return cents > 0 ? cents : null;
};

export const priceInputOf = (cents: number): string => (cents / 100).toFixed(2).replace('.', ',');

const blankToNull = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

export const settingsOf = (
  price: string,
  paymentLink: string,
  paymentNote: string,
): PotSettings | null => {
  const priceCents = centsOfPrice(price);

  return priceCents === null
    ? null
    : {
        priceCents,
        paymentLink: blankToNull(paymentLink),
        paymentNote: blankToNull(paymentNote),
      };
};

export const withPotSettings = (world: LabBeerWorld, settings: PotSettings): LabBeerOutcome => ({
  kind: 'done',
  world: { ...world, pot: { ...world.pot, ...settings } },
});
