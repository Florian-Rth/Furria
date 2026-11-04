import { isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import {
  forecastOf,
  isReminderDue,
  liveCratesOf,
  openDaysOf,
  paceOf,
  stockOf,
  tabOf,
} from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerCorrectionReason,
  LabBeerForecast,
  LabBeerTab,
  LabBeerTabCrate,
  LabBeerWorld,
} from '@/features/lab-beer/beer-lab-types';

const DAY_MS = 86_400_000;

export const SPARK_DAYS = 60;

export type PourFocus = 'all' | 'stock' | 'open' | 'overdue' | 'people';

export interface PourRosterRow {
  personId: number;
  tab: LabBeerTab;
  openDays: number | null;
  overdue: boolean;
  enrolled: boolean;
}

export interface PourHubSummary {
  stock: number;
  forecast: LabBeerForecast;
  daysLeft: number | null;
  openCents: number;
  openTabs: number;
  overdue: number;
  series: readonly number[];
}

export const stockSeriesOf = (world: LabBeerWorld, days: number): readonly number[] => {
  const end = Date.parse(world.now);
  const live = liveCratesOf(world.crates);

  return Array.from({ length: days }, (_, index) => {
    const until = end - (days - 1 - index) * DAY_MS;
    const added = world.movements
      .filter((movement) => Date.parse(movement.bookedAt) <= until)
      .reduce((sum, movement) => sum + movement.count, 0);
    const taken = live.filter((crate) => Date.parse(crate.bookedAt) <= until).length;

    return added - taken;
  });
};

const rosterOrder = (left: PourRosterRow, right: PourRosterRow): number =>
  (right.openDays ?? -1) - (left.openDays ?? -1) ||
  right.tab.openCount - left.tab.openCount ||
  left.personId - right.personId;

export const rosterOf = (world: LabBeerWorld): readonly PourRosterRow[] =>
  world.enrollments
    .map((enrollment) => enrollment.personId)
    .filter((personId, index, all) => all.indexOf(personId) === index)
    .map((personId) => {
      const tab = tabOf(personId, world.crates, world.payments);

      return {
        personId,
        tab,
        openDays: openDaysOf(tab.oldestOpenAt, world.now),
        overdue: isReminderDue(tab.oldestOpenAt, world.now),
        enrolled: isEnrolled(world, personId),
      };
    })
    .filter((row) => row.enrolled || row.tab.openCount > 0)
    .sort(rosterOrder);

export const rosterInFocus = (
  roster: readonly PourRosterRow[],
  focus: PourFocus,
): readonly PourRosterRow[] => {
  if (focus === 'overdue') {
    return roster.filter((row) => row.overdue);
  }

  return focus === 'open' ? roster.filter((row) => row.tab.openCount > 0) : roster;
};

export const hubSummaryOf = (world: LabBeerWorld): PourHubSummary => {
  const stock = stockOf(world.movements, world.crates);
  const forecast = forecastOf(stock, paceOf(world.crates, world.now), world.now);
  const roster = rosterOf(world);

  return {
    stock,
    forecast,
    daysLeft:
      forecast.emptyOn === null
        ? null
        : Math.max(0, (Date.parse(forecast.emptyOn) - Date.parse(world.now)) / DAY_MS),
    openCents: roster.reduce((sum, row) => sum + row.tab.openCents, 0),
    openTabs: roster.filter((row) => row.tab.openCount > 0).length,
    overdue: roster.filter((row) => row.overdue).length,
    series: stockSeriesOf(world, SPARK_DAYS),
  };
};

export interface PourPaymentPreview {
  settles: readonly LabBeerTabCrate[];
  cents: number;
}

export const paymentPreviewOf = (tab: LabBeerTab, crateCount: number): PourPaymentPreview => {
  const settles = tab.crates.filter((entry) => entry.paidBy === null).slice(0, crateCount);

  return { settles, cents: settles.reduce((sum, entry) => sum + entry.crate.priceCents, 0) };
};

export type PourCorrectionDirection = 'less' | 'more';

export const directionOf = (
  reason: LabBeerCorrectionReason,
  chosen: PourCorrectionDirection,
): PourCorrectionDirection => (reason === 'miscount' ? chosen : 'less');

export const correctionDeltaOf = (
  reason: LabBeerCorrectionReason,
  chosen: PourCorrectionDirection,
  count: number,
): number => (directionOf(reason, chosen) === 'less' ? -count : count);

export const countOfText = (text: string): number => {
  const value = Number.parseInt(text, 10);

  return Number.isFinite(value) && value > 0 ? value : 0;
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

export interface PourPotSettings {
  priceCents: number;
  paymentLink: string | null;
  paymentNote: string | null;
}

export const withPotSettings = (world: LabBeerWorld, settings: PourPotSettings): LabBeerWorld => ({
  ...world,
  pot: { ...world.pot, ...settings },
});

export const textOrNull = (text: string): string | null =>
  text.trim() === '' ? null : text.trim();

export type PourPersonState = 'overdue' | 'open' | 'paid';

export interface PourPerson {
  tab: LabBeerTab;
  state: PourPersonState;
  openDays: number | null;
  enrolled: boolean;
  paidNewestFirst: readonly LabBeerTabCrate[];
}

const personStateOf = (tab: LabBeerTab, now: string): PourPersonState => {
  if (isReminderDue(tab.oldestOpenAt, now)) {
    return 'overdue';
  }

  return tab.openCount > 0 ? 'open' : 'paid';
};

export const pourPersonOf = (world: LabBeerWorld, personId: number): PourPerson => {
  const tab = tabOf(personId, world.crates, world.payments);

  return {
    tab,
    state: personStateOf(tab, world.now),
    openDays: openDaysOf(tab.oldestOpenAt, world.now),
    enrolled: isEnrolled(world, personId),
    paidNewestFirst: tab.crates.filter((entry) => entry.paidBy !== null).reverse(),
  };
};
