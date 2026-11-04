import type { StartBeerTab } from './schemas';

export interface BeerTabLine {
  key: number;
  amount: string;
  crates: number;
  ownerName: string | null;
  paymentNote: string | null;
  paymentLink: string | null;
}

const CENTS_PER_EURO = 100;
const REMINDER_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const EURO = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export const formatEuroCents = (cents: number): string => EURO.format(cents / CENTS_PER_EURO);

export const isBeerTabDue = (tabs: readonly StartBeerTab[], now: Date): boolean =>
  tabs.some((tab) => now.getTime() - Date.parse(tab.oldestOpenBookedAt) >= REMINDER_AGE_MS);

export const beerTabLineOf = (tab: StartBeerTab): BeerTabLine => ({
  key: tab.beerPotId,
  amount: formatEuroCents(tab.openCents),
  crates: tab.openCrates,
  ownerName: tab.owner === null ? null : `${tab.owner.firstName} ${tab.owner.lastName}`,
  paymentNote: tab.paymentNote,
  paymentLink: tab.paymentLink,
});
