import type { PersonRef } from '@/lib/api/schemas';
import { dayKeyOf } from './beer-time';
import type {
  BeerDrinkRow,
  BeerEnrollment,
  BeerForecast,
  BeerJournalCrate,
  BeerJournalResponse,
  BeerMovement,
  BeerPaymentDrink,
  BeerPaymentPick,
  BeerPotForm,
  BeerPotTab,
  BeerStockChange,
  BeerStockDrink,
  BeerStockResponse,
} from './schemas';

const DAY_MS = 86_400_000;
export const OVERDUE_AFTER_DAYS = 7;
const WARN_WITHIN_DAYS = 7;

export const SPARK_DAYS = 60;
export const DRINK_NAME_MAX = 40;
export const MAX_DRINKS = 12;
const DEFAULT_PACE_WINDOW_DAYS = 21;

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

export interface BeerOutlook {
  emptyOn: string | null;
  daysLeft: number | null;
  warns: boolean;
  paceWindowDays: number;
}

export interface BeerHubSummary extends BeerOutlook {
  stock: number;
  leadName: string | null;
  openCents: number;
  openTabs: number;
  overdue: number;
  enrolled: number;
  drinks: readonly BeerDrinkTrend[];
  seriesFromOn: string;
}

export interface BeerDrinkTrend {
  beerDrinkId: number;
  name: string;
  stock: number;
  series: readonly number[];
  outlook: BeerOutlook;
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

const daysUntil = (emptyOn: string | null, now: string): number | null =>
  emptyOn === null
    ? null
    : Math.max(0, (Date.parse(`${emptyOn}T00:00:00.000Z`) - Date.parse(now)) / DAY_MS);

export const listedDrinksOf = (drinks: readonly BeerStockDrink[]): readonly BeerStockDrink[] =>
  drinks.filter((drink) => !drink.isRetired);

const byEmptyOn = (left: BeerStockDrink, right: BeerStockDrink): number => {
  const leftOn = left.forecast.projectedEmptyOn;
  const rightOn = right.forecast.projectedEmptyOn;

  if (leftOn === rightOn) {
    return 0;
  }
  if (leftOn === null) {
    return 1;
  }
  if (rightOn === null) {
    return -1;
  }

  return leftOn < rightOn ? -1 : 1;
};

export const leadDrinkOf = (drinks: readonly BeerStockDrink[]): BeerStockDrink | null =>
  [...listedDrinksOf(drinks)].sort(
    (left, right) =>
      byEmptyOn(left, right) ||
      left.crates - right.crates ||
      left.name.localeCompare(right.name, 'de'),
  )[0] ?? null;

export const outlookOf = (forecast: BeerForecast | null, now: string): BeerOutlook => {
  const emptyOn = forecast?.projectedEmptyOn ?? null;
  const daysLeft = daysUntil(emptyOn, now);

  return {
    emptyOn,
    daysLeft,
    warns: daysLeft !== null && daysLeft <= WARN_WITHIN_DAYS,
    paceWindowDays: forecast?.paceWindowDays ?? DEFAULT_PACE_WINDOW_DAYS,
  };
};

const MAX_PER_BOOKING = 20;
const NO_DRINK = '';

export interface BeerDrinkLimit {
  beerDrinkId: number;
  maxCount: number;
}

export const drinkLimitsOf = (drinks: readonly BeerStockDrink[]): readonly BeerDrinkLimit[] =>
  listedDrinksOf(drinks)
    .filter((drink) => drink.crates > 0)
    .map((drink) => ({
      beerDrinkId: drink.beerDrinkId,
      maxCount: Math.min(MAX_PER_BOOKING, drink.crates),
    }));

const presetOf = (candidates: readonly BeerStockDrink[]): string => {
  const preferred = candidates.find((drink) => drink.isDefault);
  const [only] = candidates;

  if (preferred !== undefined) {
    return String(preferred.beerDrinkId);
  }

  return candidates.length === 1 && only !== undefined ? String(only.beerDrinkId) : NO_DRINK;
};

export const initialDrinkOf = (drinks: readonly BeerStockDrink[]): string =>
  presetOf(listedDrinksOf(drinks).filter((drink) => drink.crates > 0));

export const initialStockDrinkOf = (drinks: readonly BeerStockDrink[]): string =>
  presetOf(listedDrinksOf(drinks));

export const stockOfDrinks = (drinks: readonly BeerStockDrink[]): number =>
  listedDrinksOf(drinks).reduce((sum, drink) => sum + drink.crates, 0);

export const drinkTrendsOf = (
  stock: BeerStockResponse,
  crates: readonly BeerJournalCrate[],
  now: string,
): readonly BeerDrinkTrend[] =>
  listedDrinksOf(stock.drinks).map((drink) => ({
    beerDrinkId: drink.beerDrinkId,
    name: drink.name,
    stock: drink.crates,
    series: stockSeriesOf(
      stock.movements.filter((movement) => movement.beerDrinkId === drink.beerDrinkId),
      crates.filter((crate) => crate.beerDrinkId === drink.beerDrinkId),
      now,
      SPARK_DAYS,
    ),
    outlook: outlookOf(drink.forecast, now),
  }));

export interface BeerSummarySource {
  stock: BeerStockResponse;
  crates: readonly BeerJournalCrate[];
  roster: readonly BeerRosterRow[];
  now: string;
}

export const hubSummaryOf = ({ stock, crates, roster, now }: BeerSummarySource): BeerHubSummary => {
  const lead = leadDrinkOf(stock.drinks);

  return {
    ...outlookOf(lead?.forecast ?? null, now),
    stock: stockOfDrinks(stock.drinks),
    leadName: listedDrinksOf(stock.drinks).length > 1 ? (lead?.name ?? null) : null,
    openCents: rosterCentsOf(roster),
    openTabs: roster.filter((row) => row.openCrates > 0).length,
    overdue: roster.filter((row) => row.state === 'overdue').length,
    enrolled: roster.filter((row) => row.enrollmentId !== null).length,
    drinks: drinkTrendsOf(stock, crates, now),
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

export interface BeerPaymentDrinkRow {
  beerDrinkId: number;
  name: string;
  open: number;
}

export interface BeerPaymentDrinkLine extends BeerPaymentDrinkRow {
  crates: number;
}

export interface BeerPaymentLine {
  crate: BeerJournalCrate;
  settled: boolean;
}

export interface BeerPaymentPreview {
  drinks: readonly BeerPaymentDrinkLine[];
  lines: readonly BeerPaymentLine[];
  crates: number;
  cents: number;
  full: boolean;
}

export const paymentRowsOf = (
  oldestFirst: readonly BeerJournalCrate[],
): readonly BeerPaymentDrinkRow[] => {
  const rows = new Map<number, BeerPaymentDrinkRow>();

  for (const crate of oldestFirst) {
    const row = rows.get(crate.beerDrinkId);
    rows.set(crate.beerDrinkId, {
      beerDrinkId: crate.beerDrinkId,
      name: crate.drinkName,
      open: (row?.open ?? 0) + 1,
    });
  }

  return [...rows.values()];
};

const pickedOf = (picks: readonly BeerPaymentPick[], beerDrinkId: number): number =>
  picks.find((pick) => pick.beerDrinkId === beerDrinkId)?.crates ?? 0;

const clampedOf = (crates: number, open: number): number =>
  Math.min(Math.max(0, Math.trunc(crates)), open);

export const paidDrinksOf = (
  rows: readonly BeerPaymentDrinkRow[],
  picks: readonly BeerPaymentPick[],
): readonly BeerPaymentPick[] =>
  rows
    .map((row) => ({
      beerDrinkId: row.beerDrinkId,
      crates: clampedOf(pickedOf(picks, row.beerDrinkId), row.open),
    }))
    .filter((pick) => pick.crates > 0);

export const fullPaymentOf = (rows: readonly BeerPaymentDrinkRow[]): readonly BeerPaymentPick[] =>
  rows.map((row) => ({ beerDrinkId: row.beerDrinkId, crates: row.open }));

export const steppedPaymentOf = (
  rows: readonly BeerPaymentDrinkRow[],
  picks: readonly BeerPaymentPick[],
  beerDrinkId: number,
  step: number,
): readonly BeerPaymentPick[] =>
  rows.map((row) => {
    const picked = pickedOf(picks, row.beerDrinkId);

    return {
      beerDrinkId: row.beerDrinkId,
      crates: clampedOf(row.beerDrinkId === beerDrinkId ? picked + step : picked, row.open),
    };
  });

export const paymentPreviewOf = (
  oldestFirst: readonly BeerJournalCrate[],
  picks: readonly BeerPaymentPick[],
): BeerPaymentPreview => {
  const rows = paymentRowsOf(oldestFirst);
  const paid = paidDrinksOf(rows, picks);
  const seen = new Map<number, number>();
  const lines = oldestFirst.map((crate) => {
    const rank = seen.get(crate.beerDrinkId) ?? 0;
    seen.set(crate.beerDrinkId, rank + 1);

    return { crate, settled: rank < pickedOf(paid, crate.beerDrinkId) };
  });

  return {
    drinks: rows.map((row) => ({ ...row, crates: pickedOf(paid, row.beerDrinkId) })),
    lines,
    crates: paid.reduce((sum, pick) => sum + pick.crates, 0),
    cents: openCentsOf(lines.filter((line) => line.settled).map((line) => line.crate)),
    full: rows.length > 0 && rows.every((row) => pickedOf(paid, row.beerDrinkId) === row.open),
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

export const EMPTY_DRINK_ROW: BeerDrinkRow = { beerDrinkId: null, name: '', price: '' };

export const priceRowOf = (drink: BeerStockDrink): BeerDrinkRow => ({
  beerDrinkId: drink.beerDrinkId,
  name: drink.name,
  price: priceTextOf(drink.cratePriceCents),
});

export const potFormOf = (
  person: PersonRef | null,
  paymentLink: string | null,
  drinks: readonly BeerDrinkRow[],
): BeerPotForm => ({
  person,
  paymentLink: paymentLink ?? '',
  drinks: [...drinks],
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
  drink: string | null;
  drinks: readonly BeerPaymentDrink[];
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
    const key = `${crate.person?.personId ?? 0}@${crate.beerDrinkId}@${crate.bookedAt}@${crate.enteredBy?.personId ?? 0}@${crate.undoneAt ?? ''}`;
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
        drink: first.drinkName,
        drinks: [],
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
  drink: movement.drinkName,
  drinks: [],
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
    drink: null,
    drinks: [],
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
        drink: null,
        drinks: payment.drinks,
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
