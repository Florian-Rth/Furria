import { isReminderDue, openDaysOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerPayment, LabBeerTab } from '@/features/lab-beer/beer-lab-types';
import { monthKeyOf } from './ledger-format';

export type LedgerRail = 'none' | 'single' | 'top' | 'middle' | 'bottom';

export interface LedgerCrateEntry {
  kind: 'crate';
  key: string;
  crateId: number;
  at: string;
  priceCents: number;
  paid: boolean;
  enteredById: number | null;
  balanceCents: number;
  group: number | null;
  rail: LedgerRail;
}

export interface LedgerPaymentEntry {
  kind: 'payment';
  key: string;
  paymentId: number;
  at: string;
  crateCount: number;
  cents: number;
  firstCrateAt: string | null;
  lastCrateAt: string | null;
  bookedById: number;
  balanceCents: number;
  group: number | null;
  rail: LedgerRail;
}

export type LedgerEntry = LedgerCrateEntry | LedgerPaymentEntry;

export interface LedgerMonth {
  key: string;
  at: string;
  crateCount: number;
  entries: readonly LedgerEntry[];
}

export type LedgerStatus = 'none' | 'clear' | 'open' | 'overdue';

export interface LedgerHead {
  openCents: number;
  openCount: number;
  paidCount: number;
  oldestOpenAt: string | null;
  openDays: number | null;
  status: LedgerStatus;
}

interface RawEntry {
  entry: LedgerEntry;
  group: number | null;
  deltaCents: number;
}

const crateRawOf = (tab: LabBeerTab): readonly RawEntry[] =>
  tab.crates.map(({ crate, paidBy }) => ({
    entry: {
      kind: 'crate',
      key: `crate-${crate.id}`,
      crateId: crate.id,
      at: crate.bookedAt,
      priceCents: crate.priceCents,
      paid: paidBy !== null,
      enteredById: crate.enteredById === crate.personId ? null : crate.enteredById,
      balanceCents: 0,
      group: paidBy?.id ?? null,
      rail: 'none',
    },
    group: paidBy?.id ?? null,
    deltaCents: crate.priceCents,
  }));

const paymentRawOf = (tab: LabBeerTab, payment: LabBeerPayment): RawEntry => {
  const settled = tab.crates.filter((entry) => entry.paidBy?.id === payment.id);
  const cents = settled.reduce((sum, entry) => sum + entry.crate.priceCents, 0);

  return {
    entry: {
      kind: 'payment',
      key: `payment-${payment.id}`,
      paymentId: payment.id,
      at: payment.bookedAt,
      crateCount: payment.crateCount,
      cents,
      firstCrateAt: settled[0]?.crate.bookedAt ?? null,
      lastCrateAt: settled.at(-1)?.crate.bookedAt ?? null,
      bookedById: payment.bookedById,
      balanceCents: 0,
      group: payment.id,
      rail: 'none',
    },
    group: payment.id,
    deltaCents: -cents,
  };
};

const chronological = (left: RawEntry, right: RawEntry): number => {
  const byTime = Date.parse(left.entry.at) - Date.parse(right.entry.at);

  if (byTime !== 0) {
    return byTime;
  }

  return left.entry.kind === right.entry.kind ? 0 : left.entry.kind === 'crate' ? -1 : 1;
};

const segmentRails = (segment: readonly LedgerEntry[]): readonly LedgerRail[] => {
  const bracketed = segment.length > 1 && segment.some((entry) => entry.kind === 'payment');

  return segment.map((_, index) => {
    if (!bracketed) {
      return 'none';
    }

    if (index === 0) {
      return 'top';
    }

    return index === segment.length - 1 ? 'bottom' : 'middle';
  });
};

const withRails = (entries: readonly LedgerEntry[]): readonly LedgerEntry[] => {
  const rails: LedgerRail[] = [];
  let start = 0;

  while (start < entries.length) {
    const group = entries[start]?.group ?? null;
    let end = start + 1;

    while (group !== null && end < entries.length && entries[end]?.group === group) {
      end += 1;
    }

    rails.push(...segmentRails(entries.slice(start, end)));
    start = end;
  }

  return entries.map((entry, index) => ({ ...entry, rail: rails[index] ?? 'none' }));
};

export const statementOf = (
  tab: LabBeerTab,
  payments: readonly LabBeerPayment[],
): readonly LedgerEntry[] => {
  const own = payments.filter((payment) => payment.personId === tab.personId);
  const raw = [...crateRawOf(tab), ...own.map((payment) => paymentRawOf(tab, payment))].sort(
    chronological,
  );
  let balance = 0;
  const balanced = raw.map((item) => {
    balance += item.deltaCents;

    return { ...item, balanceCents: balance };
  });
  const newestFirst = balanced.reverse();

  return withRails(newestFirst.map((item) => ({ ...item.entry, balanceCents: item.balanceCents })));
};

export const monthsOf = (entries: readonly LedgerEntry[]): readonly LedgerMonth[] => {
  const months: LedgerMonth[] = [];

  for (const entry of entries) {
    const key = monthKeyOf(entry.at);
    const last = months.at(-1);
    const crates = entry.kind === 'crate' ? 1 : 0;

    if (last?.key === key) {
      months[months.length - 1] = {
        ...last,
        crateCount: last.crateCount + crates,
        entries: [...last.entries, entry],
      };
    } else {
      months.push({ key, at: entry.at, crateCount: crates, entries: [entry] });
    }
  }

  return months.map((month) => ({ ...month, entries: withRails(month.entries) }));
};

export const ledgerHeadOf = (tab: LabBeerTab, now: string): LedgerHead => {
  const status: LedgerStatus =
    tab.crates.length === 0
      ? 'none'
      : tab.openCount === 0
        ? 'clear'
        : isReminderDue(tab.oldestOpenAt, now)
          ? 'overdue'
          : 'open';

  return {
    openCents: tab.openCents,
    openCount: tab.openCount,
    paidCount: tab.paidCount,
    oldestOpenAt: tab.oldestOpenAt,
    openDays: openDaysOf(tab.oldestOpenAt, now),
    status,
  };
};
