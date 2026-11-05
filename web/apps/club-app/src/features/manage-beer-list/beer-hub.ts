import type { PersonRef } from '@/lib/api/schemas';
import { dayKeyOf } from './beer-time';
import type {
  BeerEnrollment,
  BeerJournalCrate,
  BeerJournalResponse,
  BeerMovement,
  BeerPotForm,
  BeerPotSettings,
  BeerPotTab,
  BeerStockChange,
  BeerStockResponse,
} from './schemas';

const DAY_MS = 86_400_000;
export const OVERDUE_AFTER_DAYS = 7;
const WARN_WITHIN_DAYS = 7;

export const SPARK_DAYS = 60;

export type BeerTabState = 'overdue' | 'open' | 'paid';

export interface BeerRosterRow {
  person: PersonRef;
  enrollmentId: number | null;
  openCrates: number;
  openCents: number;
  paidCrates: number;
  openDays: number | null;
  state: BeerTabState;
}

export interface BeerHubSummary {
  stock: number;
  emptyOn: string | null;
  daysLeft: number | null;
  warns: boolean;
  openCents: number;
  openTabs: number;
  overdue: number;
  enrolled: number;
  paceWindowDays: number;
  series: readonly number[];
  deliveries: readonly number[];
  seriesFromOn: string;
}

export const openDaysOf = (oldestOpenAt: string | null, now: string): number | null =>
  oldestOpenAt === null ? null : Math.floor((Date.parse(now) - Date.parse(oldestOpenAt)) / DAY_MS);

const stateOf = (openCrates: number, openDays: number | null): BeerTabState => {
  if ((openDays ?? 0) >= OVERDUE_AFTER_DAYS) {
    return 'overdue';
  }

  return openCrates > 0 ? 'open' : 'paid';
};

const runningEnrollmentsOf = (
  enrollments: readonly BeerEnrollment[],
): ReadonlyMap<number, BeerEnrollment> =>
  new Map(
    enrollments
      .filter((enrollment) => enrollment.endedAt === null)
      .map((enrollment) => [enrollment.personId, enrollment]),
  );

const rowOfTab = (
  tab: BeerPotTab,
  running: ReadonlyMap<number, BeerEnrollment>,
  now: string,
): BeerRosterRow => {
  const openDays = openDaysOf(tab.oldestOpenBookedAt, now);

  return {
    person: tab.person,
    enrollmentId: running.get(tab.person.personId)?.enrollmentId ?? null,
    openCrates: tab.openCrates,
    openCents: tab.openCents,
    paidCrates: tab.paidCrates,
    openDays,
    state: stateOf(tab.openCrates, openDays),
  };
};

const rowOfEnrollment = (enrollment: BeerEnrollment): BeerRosterRow => ({
  person: {
    personId: enrollment.personId,
    firstName: enrollment.firstName,
    lastName: enrollment.lastName,
  },
  enrollmentId: enrollment.enrollmentId,
  openCrates: 0,
  openCents: 0,
  paidCrates: 0,
  openDays: null,
  state: 'paid',
});

const rosterOrder = (left: BeerRosterRow, right: BeerRosterRow): number =>
  (right.openDays ?? -1) - (left.openDays ?? -1) ||
  right.openCrates - left.openCrates ||
  left.person.lastName.localeCompare(right.person.lastName, 'de') ||
  left.person.firstName.localeCompare(right.person.firstName, 'de') ||
  left.person.personId - right.person.personId;

export const rosterOf = (
  tabs: readonly BeerPotTab[],
  enrollments: readonly BeerEnrollment[],
  now: string,
): readonly BeerRosterRow[] => {
  const running = runningEnrollmentsOf(enrollments);
  const tabbed = new Set(tabs.map((tab) => tab.person.personId));
  const withTab = tabs
    .filter((tab) => tab.openCrates > 0 || running.has(tab.person.personId))
    .map((tab) => rowOfTab(tab, running, now));
  const withoutTab = [...running.values()]
    .filter((enrollment) => !tabbed.has(enrollment.personId))
    .map(rowOfEnrollment);

  return [...withTab, ...withoutTab].sort(rosterOrder);
};

export const openRosterOf = (roster: readonly BeerRosterRow[]): readonly BeerRosterRow[] =>
  roster.filter((row) => row.openCrates > 0);

const isTakenAt = (crate: BeerJournalCrate, until: number): boolean =>
  Date.parse(crate.bookedAt) <= until &&
  (crate.undoneAt === null || Date.parse(crate.undoneAt) > until);

export const stockSeriesOf = (
  movements: readonly BeerMovement[],
  crates: readonly BeerJournalCrate[],
  now: string,
  days: number,
): readonly number[] => {
  const end = Date.parse(now);

  return Array.from({ length: days }, (_, index) => {
    const until = end - (days - 1 - index) * DAY_MS;
    const added = movements
      .filter((movement) => Date.parse(movement.bookedAt) <= until)
      .reduce((sum, movement) => sum + movement.crates, 0);
    const taken = crates.filter((crate) => isTakenAt(crate, until)).length;

    return added - taken;
  });
};

const restocks = (movement: BeerMovement): boolean =>
  movement.crates > 0 && (movement.kind === 'delivery' || movement.kind === 'handoverCarry');

export const deliveriesOf = (
  movements: readonly BeerMovement[],
  now: string,
  days: number,
): readonly number[] => {
  const end = Date.parse(now);
  const restocked = movements.filter(restocks);

  return Array.from({ length: days }, (_, index) => {
    const until = end - (days - 1 - index) * DAY_MS;
    const since = until - DAY_MS;

    return restocked
      .filter((movement) => {
        const at = Date.parse(movement.bookedAt);

        return at > since && at <= until;
      })
      .reduce((sum, movement) => sum + movement.crates, 0);
  });
};

const daysUntil = (emptyOn: string | null, now: string): number | null =>
  emptyOn === null
    ? null
    : Math.max(0, (Date.parse(`${emptyOn}T00:00:00.000Z`) - Date.parse(now)) / DAY_MS);

export interface BeerSummarySource {
  stock: BeerStockResponse;
  crates: readonly BeerJournalCrate[];
  roster: readonly BeerRosterRow[];
  now: string;
}

export const hubSummaryOf = ({ stock, crates, roster, now }: BeerSummarySource): BeerHubSummary => {
  const emptyOn = stock.forecast.projectedEmptyOn;
  const daysLeft = daysUntil(emptyOn, now);

  return {
    stock: stock.crates,
    emptyOn,
    daysLeft,
    warns: daysLeft !== null && daysLeft <= WARN_WITHIN_DAYS,
    openCents: rosterCentsOf(roster),
    openTabs: roster.filter((row) => row.openCrates > 0).length,
    overdue: roster.filter((row) => row.state === 'overdue').length,
    enrolled: roster.filter((row) => row.enrollmentId !== null).length,
    paceWindowDays: stock.forecast.paceWindowDays,
    series: stockSeriesOf(stock.movements, crates, now, SPARK_DAYS),
    deliveries: deliveriesOf(stock.movements, now, SPARK_DAYS),
    seriesFromOn: dayKeyOf(new Date(Date.parse(now) - (SPARK_DAYS - 1) * DAY_MS).toISOString()),
  };
};

export const openCratesOf = (
  crates: readonly BeerJournalCrate[],
  personId: number,
): readonly BeerJournalCrate[] =>
  crates
    .filter(
      (crate) =>
        crate.person?.personId === personId &&
        crate.undoneAt === null &&
        crate.beerPaymentId === null,
    )
    .sort(
      (left, right) =>
        Date.parse(left.bookedAt) - Date.parse(right.bookedAt) || left.crateId - right.crateId,
    );

export const openCentsOf = (crates: readonly BeerJournalCrate[]): number =>
  crates.reduce((sum, crate) => sum + crate.priceCents, 0);

export const rosterCentsOf = (rows: readonly BeerRosterRow[]): number =>
  rows.reduce((sum, row) => sum + row.openCents, 0);

export interface BeerPaymentLine {
  crate: BeerJournalCrate;
  settled: boolean;
}

export interface BeerPaymentPreview {
  lines: readonly BeerPaymentLine[];
  cents: number;
}

export const paymentPreviewOf = (
  oldestFirst: readonly BeerJournalCrate[],
  count: number,
): BeerPaymentPreview => {
  const settledCount = Math.max(0, count);

  return {
    lines: oldestFirst.map((crate, index) => ({ crate, settled: index < settledCount })),
    cents: openCentsOf(oldestFirst.slice(0, settledCount)),
  };
};

export const crateStateOf = (crate: BeerJournalCrate, now: string): BeerTabState => {
  if (crate.beerPaymentId !== null) {
    return 'paid';
  }

  return (openDaysOf(crate.bookedAt, now) ?? 0) >= OVERDUE_AFTER_DAYS ? 'overdue' : 'open';
};

export const stockChangeOf = (crates: number): BeerStockChange | null => {
  if (crates === 0) {
    return null;
  }

  return { kind: crates > 0 ? 'delivery' : 'correction', crates };
};

export const stockDeltaOf = (change: BeerStockChange | null): number => change?.crates ?? 0;

export const countOfText = (text: string): number => {
  const value = Number.parseInt(text, 10);

  return Number.isFinite(value) && value > 0 ? value : 0;
};

export const STOCK_MAX_CRATES = 500;

const SIGNED_COUNT_PATTERN = /^([+\-−]?)(\d+)$/;

export const signedCountOfText = (text: string): number => {
  const match = SIGNED_COUNT_PATTERN.exec(text.trim());

  if (match === null) {
    return 0;
  }

  const count = Number(match[2]);

  return match[1] === '-' || match[1] === '−' ? -count : count;
};

const PRICE_PATTERN = /^(\d{1,3})(?:[,.](\d{1,2}))?$/;

export const centsOfPriceText = (text: string): number | null => {
  const match = PRICE_PATTERN.exec(text.replace('€', '').trim());

  if (match === null) {
    return null;
  }

  const cents = Number(match[1]) * 100 + Number((match[2] ?? '0').padEnd(2, '0'));

  return cents > 0 ? cents : null;
};

export const priceTextOf = (cents: number): string =>
  `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, '0')}`;

export const textOrNull = (text: string): string | null =>
  text.trim() === '' ? null : text.trim();

export const potFormOf = (
  person: PersonRef | null,
  settings: BeerPotSettings | null,
): BeerPotForm => ({
  person,
  cratePrice: settings === null ? '' : priceTextOf(settings.cratePriceCents),
  paymentLink: settings?.paymentLink ?? '',
});

export type BeerJournalKind =
  | 'crate'
  | 'payment'
  | 'delivery'
  | 'correction'
  | 'enrolled'
  | 'ended';

export type BeerKindFilter = 'all' | 'crate' | 'payment' | 'stock' | 'enrollment';

export interface BeerJournalEntry {
  key: string;
  kind: BeerJournalKind;
  at: string;
  person: PersonRef | null;
  actor: PersonRef | null;
  count: number;
  stockDelta: number;
  cents: number | null;
  movement: BeerMovement['kind'] | null;
  undone: boolean;
}

export interface BeerJournalDay {
  dayKey: string;
  entries: readonly BeerJournalEntry[];
}

export interface BeerJournalFilter {
  kind: BeerKindFilter;
  personId: number | null;
}

const KIND_GROUPS: Record<BeerKindFilter, readonly BeerJournalKind[]> = {
  all: ['crate', 'payment', 'delivery', 'correction', 'enrolled', 'ended'],
  crate: ['crate'],
  payment: ['payment'],
  stock: ['crate', 'delivery', 'correction'],
  enrollment: ['enrolled', 'ended'],
};

const crateEntriesOf = (crates: readonly BeerJournalCrate[]): readonly BeerJournalEntry[] => {
  const groups = new Map<string, BeerJournalCrate[]>();

  for (const crate of crates) {
    const key = `${crate.person?.personId ?? 0}@${crate.bookedAt}@${crate.enteredBy?.personId ?? 0}@${crate.undoneAt ?? ''}`;
    groups.set(key, [...(groups.get(key) ?? []), crate]);
  }

  return [...groups.entries()].flatMap(([key, group]): BeerJournalEntry[] => {
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
        person: first.person,
        actor: first.enteredBy,
        count: group.length,
        stockDelta: undone ? 0 : -group.length,
        cents: group.reduce((sum, crate) => sum + crate.priceCents, 0),
        movement: null,
        undone,
      },
    ];
  });
};

const movementEntryOf = (movement: BeerMovement): BeerJournalEntry => ({
  key: `m${movement.movementId}`,
  kind: movement.kind === 'correction' ? 'correction' : 'delivery',
  at: movement.bookedAt,
  person: null,
  actor: movement.bookedBy,
  count: Math.abs(movement.crates),
  stockDelta: movement.crates,
  cents: null,
  movement: movement.kind,
  undone: false,
});

const enrollmentEntriesOf = (enrollment: BeerEnrollment): readonly BeerJournalEntry[] => {
  const person: PersonRef = {
    personId: enrollment.personId,
    firstName: enrollment.firstName,
    lastName: enrollment.lastName,
  };
  const started: BeerJournalEntry = {
    key: `e${enrollment.enrollmentId}`,
    kind: 'enrolled',
    at: enrollment.startedAt,
    person,
    actor: person,
    count: 0,
    stockDelta: 0,
    cents: null,
    movement: null,
    undone: false,
  };

  return enrollment.endedAt === null
    ? [started]
    : [
        started,
        {
          ...started,
          key: `x${enrollment.enrollmentId}`,
          kind: 'ended',
          at: enrollment.endedAt,
          actor: enrollment.endedBy,
        },
      ];
};

export interface BeerJournalSource {
  journal: BeerJournalResponse;
  movements: readonly BeerMovement[];
  enrollments: readonly BeerEnrollment[];
  since: string;
}

export const journalOf = ({
  journal,
  movements,
  enrollments,
  since,
}: BeerJournalSource): readonly BeerJournalEntry[] =>
  [
    ...crateEntriesOf(journal.crates),
    ...journal.payments.map(
      (payment): BeerJournalEntry => ({
        key: `p${payment.beerPaymentId}`,
        kind: 'payment',
        at: payment.bookedAt,
        person: payment.person,
        actor: payment.bookedBy,
        count: payment.crates,
        stockDelta: 0,
        cents: payment.amountCents,
        movement: null,
        undone: payment.undoneAt !== null,
      }),
    ),
    ...movements.map(movementEntryOf),
    ...enrollments
      .flatMap(enrollmentEntriesOf)
      .filter((entry) => Date.parse(entry.at) >= Date.parse(since)),
  ].sort(
    (left, right) =>
      Date.parse(right.at) - Date.parse(left.at) || left.key.localeCompare(right.key),
  );

export const filteredJournalOf = (
  journal: readonly BeerJournalEntry[],
  filter: BeerJournalFilter,
): readonly BeerJournalEntry[] =>
  journal.filter(
    (entry) =>
      KIND_GROUPS[filter.kind].includes(entry.kind) &&
      (filter.personId === null || entry.person?.personId === filter.personId),
  );

export const journalDaysOf = (entries: readonly BeerJournalEntry[]): readonly BeerJournalDay[] => {
  const days = new Map<string, BeerJournalEntry[]>();

  for (const entry of entries) {
    const dayKey = dayKeyOf(entry.at);
    days.set(dayKey, [...(days.get(dayKey) ?? []), entry]);
  }

  return [...days.entries()].map(([dayKey, dayEntries]) => ({ dayKey, entries: dayEntries }));
};

export interface BeerBookable {
  person: PersonRef;
  enrolled: boolean;
}

export const bookableOf = (enrollments: readonly BeerEnrollment[]): readonly BeerBookable[] => {
  const byPerson = new Map<number, BeerBookable>();

  for (const enrollment of enrollments) {
    const enrolled =
      enrollment.endedAt === null || (byPerson.get(enrollment.personId)?.enrolled ?? false);
    byPerson.set(enrollment.personId, {
      person: {
        personId: enrollment.personId,
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
      },
      enrolled,
    });
  }

  return [...byPerson.values()].sort(
    (left, right) =>
      Number(right.enrolled) - Number(left.enrolled) ||
      left.person.lastName.localeCompare(right.person.lastName, 'de') ||
      left.person.firstName.localeCompare(right.person.firstName, 'de'),
  );
};
