import type { KkTabStrokeState } from '@furria/ui/tab-strokes';
import { openDaysOf, REMINDER_AFTER_DAYS } from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerPayment,
  LabBeerTab,
  LabBeerTabCrate,
} from '@/features/lab-beer/beer-lab-types';

export interface BeerAOpenGroup {
  kind: 'open';
  crates: readonly LabBeerTabCrate[];
  cents: number;
}

export interface BeerAPaidGroup {
  kind: 'paid';
  payment: LabBeerPayment;
  crates: readonly LabBeerTabCrate[];
  cents: number;
}

export type BeerAHistoryGroup = BeerAOpenGroup | BeerAPaidGroup;

const centsOf = (crates: readonly LabBeerTabCrate[]): number =>
  crates.reduce((sum, entry) => sum + entry.crate.priceCents, 0);

const newestFirst = (crates: readonly LabBeerTabCrate[]): readonly LabBeerTabCrate[] =>
  [...crates].sort((left, right) => right.crate.bookedAt.localeCompare(left.crate.bookedAt));

export const isCrateOverdue = (bookedAt: string, now: string): boolean =>
  (openDaysOf(bookedAt, now) ?? 0) >= REMINDER_AFTER_DAYS;

export const strokeOf = (
  entry: LabBeerTabCrate,
  now: string,
  freshIds: readonly number[],
): KkTabStrokeState => {
  if (entry.paidBy !== null) {
    return 'paid';
  }

  if (freshIds.includes(entry.crate.id)) {
    return 'fresh';
  }

  return isCrateOverdue(entry.crate.bookedAt, now) ? 'overdue' : 'open';
};

export const tabStrokesOf = (
  tab: LabBeerTab,
  now: string,
  freshIds: readonly number[],
): readonly KkTabStrokeState[] => tab.crates.map((entry) => strokeOf(entry, now, freshIds));

export const openStrokesOf = (tab: LabBeerTab, now: string): readonly KkTabStrokeState[] =>
  tab.crates.filter((entry) => entry.paidBy === null).map((entry) => strokeOf(entry, now, []));

export const historyOf = (tab: LabBeerTab): readonly BeerAHistoryGroup[] => {
  const open = tab.crates.filter((entry) => entry.paidBy === null);
  const payments = new Map<number, { payment: LabBeerPayment; crates: LabBeerTabCrate[] }>();

  for (const entry of tab.crates) {
    if (entry.paidBy !== null) {
      const known = payments.get(entry.paidBy.id) ?? { payment: entry.paidBy, crates: [] };
      known.crates.push(entry);
      payments.set(entry.paidBy.id, known);
    }
  }

  const paidGroups: readonly BeerAPaidGroup[] = [...payments.values()]
    .sort((left, right) => right.payment.bookedAt.localeCompare(left.payment.bookedAt))
    .map((group) => ({
      kind: 'paid',
      payment: group.payment,
      crates: newestFirst(group.crates),
      cents: centsOf(group.crates),
    }));
  const openGroups: readonly BeerAOpenGroup[] =
    open.length === 0 ? [] : [{ kind: 'open', crates: newestFirst(open), cents: centsOf(open) }];

  return [...openGroups, ...paidGroups];
};

export interface BeerASettlePlan {
  settles: readonly LabBeerTabCrate[];
  stays: readonly LabBeerTabCrate[];
  cents: number;
}

export const settlePlanOf = (tab: LabBeerTab, count: number): BeerASettlePlan => {
  const open = tab.crates.filter((entry) => entry.paidBy === null);
  const settles = open.slice(0, Math.max(0, Math.min(count, open.length)));

  return { settles, stays: open.slice(settles.length), cents: centsOf(settles) };
};
