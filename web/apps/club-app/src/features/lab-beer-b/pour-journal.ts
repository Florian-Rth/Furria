import { tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerCorrectionReason,
  LabBeerCrate,
  LabBeerWorld,
} from '@/features/lab-beer/beer-lab-types';
import type { PourFocus } from './pour-hub';
import { dayKeyOf } from './pour-time';

export type PourJournalKind =
  | 'crate'
  | 'payment'
  | 'delivery'
  | 'correction'
  | 'enrolled'
  | 'ended';

export type PourKindFilter = 'all' | 'crate' | 'payment' | 'stock' | 'enrollment';

export interface PourJournalEntry {
  key: string;
  kind: PourJournalKind;
  at: string;
  personId: number | null;
  actorId: number | null;
  count: number;
  stockDelta: number;
  cents: number | null;
  reason: LabBeerCorrectionReason | null;
  undone: boolean;
}

export interface PourJournalDay {
  dayKey: string;
  entries: readonly PourJournalEntry[];
}

export interface PourJournalFilter {
  kind: PourKindFilter;
  personId: number | null;
  focus: PourFocus;
  focusPersonIds: ReadonlySet<number>;
}

const KIND_GROUPS: Record<PourKindFilter, readonly PourJournalKind[]> = {
  all: ['crate', 'payment', 'delivery', 'correction', 'enrolled', 'ended'],
  crate: ['crate'],
  payment: ['payment'],
  stock: ['crate', 'delivery', 'correction'],
  enrollment: ['enrolled', 'ended'],
};

const crateEntriesOf = (crates: readonly LabBeerCrate[]): readonly PourJournalEntry[] => {
  const groups = new Map<string, LabBeerCrate[]>();

  for (const crate of crates) {
    const key = `${crate.personId}@${crate.bookedAt}@${crate.undoneAt ?? ''}`;
    groups.set(key, [...(groups.get(key) ?? []), crate]);
  }

  return [...groups.entries()].flatMap(([key, group]): PourJournalEntry[] => {
    const [first] = group;

    if (first === undefined) {
      return [];
    }

    const undone = first.undoneAt !== null;

    return [
      {
        key: `c${key}`,
        kind: 'crate',
        at: first.bookedAt,
        personId: first.personId,
        actorId: first.enteredById,
        count: group.length,
        stockDelta: undone ? 0 : -group.length,
        cents: group.reduce((sum, crate) => sum + crate.priceCents, 0),
        reason: null,
        undone,
      },
    ];
  });
};

const paymentCentsOf = (world: LabBeerWorld): ReadonlyMap<number, number> => {
  const cents = new Map<number, number>();
  const personIds = new Set(world.payments.map((payment) => payment.personId));

  for (const personId of personIds) {
    for (const { crate, paidBy } of tabOf(personId, world.crates, world.payments).crates) {
      if (paidBy !== null) {
        cents.set(paidBy.id, (cents.get(paidBy.id) ?? 0) + crate.priceCents);
      }
    }
  }

  return cents;
};

export const journalOf = (world: LabBeerWorld): readonly PourJournalEntry[] => {
  const paid = paymentCentsOf(world);

  return [
    ...crateEntriesOf(world.crates),
    ...world.payments.map(
      (payment): PourJournalEntry => ({
        key: `p${payment.id}`,
        kind: 'payment',
        at: payment.bookedAt,
        personId: payment.personId,
        actorId: payment.bookedById,
        count: payment.crateCount,
        stockDelta: 0,
        cents: paid.get(payment.id) ?? null,
        reason: null,
        undone: false,
      }),
    ),
    ...world.movements.map(
      (movement): PourJournalEntry => ({
        key: `m${movement.id}`,
        kind: movement.kind === 'correction' ? 'correction' : 'delivery',
        at: movement.bookedAt,
        personId: null,
        actorId: movement.bookedById,
        count: Math.abs(movement.count),
        stockDelta: movement.count,
        cents: null,
        reason: movement.reason,
        undone: false,
      }),
    ),
    ...world.enrollments.flatMap((enrollment): PourJournalEntry[] => {
      const started: PourJournalEntry = {
        key: `e${enrollment.personId}@${enrollment.startedAt}`,
        kind: 'enrolled',
        at: enrollment.startedAt,
        personId: enrollment.personId,
        actorId: enrollment.personId,
        count: 0,
        stockDelta: 0,
        cents: null,
        reason: null,
        undone: false,
      };

      return enrollment.endedAt === null
        ? [started]
        : [
            started,
            {
              ...started,
              key: `x${enrollment.personId}@${enrollment.endedAt}`,
              kind: 'ended',
              at: enrollment.endedAt,
              actorId: enrollment.endedById,
            },
          ];
    }),
  ].sort((left, right) => right.at.localeCompare(left.at) || left.key.localeCompare(right.key));
};

const matchesFocus = (entry: PourJournalEntry, filter: PourJournalFilter): boolean => {
  if (filter.focus === 'all' || filter.focus === 'people') {
    return true;
  }

  if (filter.focus === 'stock') {
    return entry.stockDelta !== 0;
  }

  return entry.personId !== null && filter.focusPersonIds.has(entry.personId);
};

export const filteredJournalOf = (
  journal: readonly PourJournalEntry[],
  filter: PourJournalFilter,
): readonly PourJournalEntry[] =>
  journal.filter(
    (entry) =>
      KIND_GROUPS[filter.kind].includes(entry.kind) &&
      (filter.personId === null || entry.personId === filter.personId) &&
      matchesFocus(entry, filter),
  );

export const journalDaysOf = (entries: readonly PourJournalEntry[]): readonly PourJournalDay[] => {
  const days = new Map<string, PourJournalEntry[]>();

  for (const entry of entries) {
    const dayKey = dayKeyOf(entry.at);
    days.set(dayKey, [...(days.get(dayKey) ?? []), entry]);
  }

  return [...days.entries()].map(([dayKey, dayEntries]) => ({ dayKey, entries: dayEntries }));
};
