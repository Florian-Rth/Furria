import { formatEuroCents, payPalLinkOf } from '@/lib/money';
import type { StartBeerTab } from './schemas';

export interface BeerTabLine {
  key: number;
  title: string;
  meta: string;
  payHref: string | null;
  payLabel: string;
}

const DAY_MS = 86_400_000;
const REMINDER_DAYS = 7;
const REMINDER_AGE_MS = REMINDER_DAYS * DAY_MS;
const META_SEPARATOR = ' · ';
const ONE_CRATE = 'Kiste';
const CRATES = 'Kisten';

const cratesLabelOf = (crates: number): string => `${crates} ${crates === 1 ? ONE_CRATE : CRATES}`;

const ownerNameOf = (tab: StartBeerTab): string | null =>
  tab.owner === null ? null : `${tab.owner.firstName} ${tab.owner.lastName}`;

export const isBeerTabDue = (tabs: readonly StartBeerTab[], now: Date): boolean =>
  tabs.some((tab) => now.getTime() - Date.parse(tab.oldestOpenBookedAt) >= REMINDER_AGE_MS);

export const beerTabLineOf = (tab: StartBeerTab): BeerTabLine => {
  const amount = formatEuroCents(tab.openCents);
  const owner = ownerNameOf(tab);
  const ownerPart = owner === null ? '' : ` an ${owner}`;

  return {
    key: tab.beerPotId,
    title: `${amount} offen${ownerPart}`,
    meta: [tab.paymentNote, cratesLabelOf(tab.openCrates)]
      .filter((part): part is string => part !== null)
      .join(META_SEPARATOR),
    payHref: tab.paymentLink === null ? null : payPalLinkOf(tab.paymentLink, tab.openCents),
    payLabel: `${amount}${ownerPart} per PayPal bezahlen`,
  };
};
