import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import { payPalLinkOf } from '@/lib/money';
import type { BeerListPerson, BeerTabCrate, BeerTabPot } from './schemas';

export const REMINDER_AFTER_DAYS = 7;

const DAY_MS = 86_400_000;

export interface BeerTabTotals {
  openCents: number;
  openCount: number;
  paidCount: number;
  oldestOpenAt: string | null;
}

export interface BeerOpenGroup {
  kind: 'open';
  key: string;
  owner: BeerListPerson | null;
  current: boolean;
  crates: readonly BeerTabCrate[];
  cents: number;
}

export interface BeerPaidGroup {
  kind: 'paid';
  key: string;
  paidAt: string;
  crates: readonly BeerTabCrate[];
  cents: number;
}

export type BeerHistoryGroup = BeerOpenGroup | BeerPaidGroup;

export interface BeerPayee {
  potId: number;
  owner: BeerListPerson | null;
  current: boolean;
  openCents: number;
  payHref: string | null;
  note: string | null;
}

const byBookedAt = (left: BeerTabCrate, right: BeerTabCrate): number =>
  Date.parse(left.bookedAt) - Date.parse(right.bookedAt) || left.crateId - right.crateId;

const newestFirst = (crates: readonly BeerTabCrate[]): readonly BeerTabCrate[] =>
  [...crates].sort((left, right) => byBookedAt(right, left));

export const centsOf = (crates: readonly BeerTabCrate[]): number =>
  crates.reduce((sum, crate) => sum + crate.priceCents, 0);

const cratesOf = (pots: readonly BeerTabPot[]): readonly BeerTabCrate[] =>
  pots.flatMap((pot) => pot.crates);

export const openDaysOf = (bookedAt: string, now: number): number =>
  Math.max(0, Math.floor((now - Date.parse(bookedAt)) / DAY_MS));

export const isCrateOverdue = (crate: BeerTabCrate, now: number): boolean =>
  crate.paidAt === null && openDaysOf(crate.bookedAt, now) >= REMINDER_AFTER_DAYS;

export const strokeOf = (
  crate: BeerTabCrate,
  now: number,
  freshIds: readonly number[],
): KkTabStrokeState => {
  if (crate.paidAt !== null) {
    return 'paid';
  }

  if (freshIds.includes(crate.crateId)) {
    return 'fresh';
  }

  return isCrateOverdue(crate, now) ? 'overdue' : 'open';
};

export const tabStrokesOf = (
  pots: readonly BeerTabPot[],
  now: number,
  freshIds: readonly number[],
): readonly KkTabStrokeState[] =>
  [...cratesOf(pots)].sort(byBookedAt).map((crate) => strokeOf(crate, now, freshIds));

export const tabTotalsOf = (pots: readonly BeerTabPot[]): BeerTabTotals => {
  const open = cratesOf(pots).filter((crate) => crate.paidAt === null);
  const oldest = [...open].sort(byBookedAt)[0];

  return {
    openCents: centsOf(open),
    openCount: open.length,
    paidCount: cratesOf(pots).length - open.length,
    oldestOpenAt: oldest?.bookedAt ?? null,
  };
};

export const historyGroupsOf = (pots: readonly BeerTabPot[]): readonly BeerHistoryGroup[] => {
  const openGroups: readonly BeerOpenGroup[] = pots
    .map((pot) => ({ pot, open: pot.crates.filter((crate) => crate.paidAt === null) }))
    .filter(({ open }) => open.length > 0)
    .map(({ pot, open }) => ({
      kind: 'open',
      key: `open-${pot.beerPotId}`,
      owner: pot.owner,
      current: pot.isOpen,
      crates: newestFirst(open),
      cents: centsOf(open),
    }));
  const payments = new Map<string, { paidAt: string; crates: BeerTabCrate[] }>();

  for (const pot of pots) {
    for (const crate of pot.crates) {
      if (crate.paidAt !== null) {
        const key = `paid-${pot.beerPotId}-${crate.paidAt}`;
        const known = payments.get(key) ?? { paidAt: crate.paidAt, crates: [] };

        known.crates.push(crate);
        payments.set(key, known);
      }
    }
  }

  const paidGroups: readonly BeerPaidGroup[] = [...payments.entries()]
    .sort(([, left], [, right]) => Date.parse(right.paidAt) - Date.parse(left.paidAt))
    .map(([key, group]) => ({
      kind: 'paid',
      key,
      paidAt: group.paidAt,
      crates: newestFirst(group.crates),
      cents: centsOf(group.crates),
    }));

  return [...openGroups, ...paidGroups];
};

export const payeesOf = (pots: readonly BeerTabPot[]): readonly BeerPayee[] =>
  pots
    .map((pot) => ({
      pot,
      openCents: centsOf(pot.crates.filter((crate) => crate.paidAt === null)),
    }))
    .filter(({ openCents }) => openCents > 0)
    .map(({ pot, openCents }) => ({
      potId: pot.beerPotId,
      owner: pot.owner,
      current: pot.isOpen,
      openCents,
      payHref: pot.paymentLink === null ? null : payPalLinkOf(pot.paymentLink, openCents),
      note: pot.paymentNote,
    }));
