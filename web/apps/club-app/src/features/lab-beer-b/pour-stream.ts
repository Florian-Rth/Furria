import { isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import { liveCratesOf, tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerCrate, LabBeerTab, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { dayKeyOf } from './pour-time';

export type PourFilter = 'all' | 'mine';

export type PourOwnState = 'open' | 'paid' | 'part';

export interface PourCrateEntry {
  kind: 'crates';
  key: string;
  personId: number;
  count: number;
  at: string;
  crateIds: readonly number[];
  own: boolean;
  state: PourOwnState | null;
  enteredById: number | null;
}

export interface PourSettleEntry {
  kind: 'settle';
  key: string;
  crateCount: number;
  cents: number;
  at: string;
}

export type PourEntry = PourCrateEntry | PourSettleEntry;

export interface PourDay {
  dayKey: string;
  crateCount: number;
  entries: readonly PourEntry[];
}

const newestFirst = (left: { at: string }, right: { at: string }): number =>
  right.at.localeCompare(left.at);

const bookingKeyOf = (crate: LabBeerCrate): string => `${crate.personId}@${crate.bookedAt}`;

const ownStateOf = (crateIds: readonly number[], paidIds: ReadonlySet<number>): PourOwnState => {
  const paid = crateIds.filter((id) => paidIds.has(id)).length;

  if (paid === 0) {
    return 'open';
  }

  return paid === crateIds.length ? 'paid' : 'part';
};

const bookingsOf = (
  crates: readonly LabBeerCrate[],
  viewerId: number,
  paidIds: ReadonlySet<number>,
): readonly PourCrateEntry[] => {
  const groups = new Map<string, LabBeerCrate[]>();

  for (const crate of liveCratesOf(crates)) {
    const key = bookingKeyOf(crate);
    groups.set(key, [...(groups.get(key) ?? []), crate]);
  }

  return [...groups.entries()].flatMap(([key, group]): PourCrateEntry[] => {
    const [first] = group;

    if (first === undefined) {
      return [];
    }

    const crateIds = group.map((crate) => crate.id);
    const own = first.personId === viewerId;

    return [
      {
        kind: 'crates',
        key: `c${key}`,
        personId: first.personId,
        count: group.length,
        at: first.bookedAt,
        crateIds,
        own,
        state: own ? ownStateOf(crateIds, paidIds) : null,
        enteredById: first.enteredById === first.personId ? null : first.enteredById,
      },
    ];
  });
};

const settlesOf = (tab: LabBeerTab): readonly PourSettleEntry[] => {
  const payments = new Map<number, PourSettleEntry>();

  for (const { crate, paidBy } of tab.crates) {
    if (paidBy !== null) {
      const known = payments.get(paidBy.id);
      payments.set(paidBy.id, {
        kind: 'settle',
        key: `p${paidBy.id}`,
        crateCount: paidBy.crateCount,
        cents: (known?.cents ?? 0) + crate.priceCents,
        at: paidBy.bookedAt,
      });
    }
  }

  return [...payments.values()];
};

export const showsEveryoneTo = (world: LabBeerWorld, viewerId: number): boolean =>
  isEnrolled(world, viewerId);

export const streamOf = (
  world: LabBeerWorld,
  viewerId: number,
  filter: PourFilter,
): readonly PourDay[] => {
  const tab = tabOf(viewerId, world.crates, world.payments);
  const paidIds = new Set(
    tab.crates.filter((entry) => entry.paidBy !== null).map((entry) => entry.crate.id),
  );
  const mineOnly = filter === 'mine' || !showsEveryoneTo(world, viewerId);
  const crates = mineOnly
    ? world.crates.filter((crate) => crate.personId === viewerId)
    : world.crates;
  const entries: PourEntry[] = [...bookingsOf(crates, viewerId, paidIds), ...settlesOf(tab)].sort(
    newestFirst,
  );
  const days = new Map<string, PourEntry[]>();

  for (const entry of entries) {
    const dayKey = dayKeyOf(entry.at);
    days.set(dayKey, [...(days.get(dayKey) ?? []), entry]);
  }

  return [...days.entries()].map(([dayKey, dayEntries]) => ({
    dayKey,
    crateCount: dayEntries.reduce(
      (sum, entry) => sum + (entry.kind === 'crates' ? entry.count : 0),
      0,
    ),
    entries: dayEntries,
  }));
};
