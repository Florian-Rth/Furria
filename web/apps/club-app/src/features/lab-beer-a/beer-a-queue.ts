import {
  forecastOf,
  openDaysOf,
  paceOf,
  REMINDER_AFTER_DAYS,
  stockOf,
  tabOf,
} from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerForecast,
  LabBeerStockMovement,
  LabBeerTab,
  LabBeerWorld,
} from '@/features/lab-beer/beer-lab-types';

const DAY_MS = 86_400_000;
const MOVEMENT_LINES = 12;

export interface BeerAQueueRow {
  personId: number;
  tab: LabBeerTab;
  openDays: number;
  overdue: boolean;
  enrolled: boolean;
}

export interface BeerASettledRow {
  personId: number;
  paidCount: number;
  lastPaidAt: string;
}

export interface BeerAQueueCounts {
  open: number;
  overdue: number;
  cents: number;
}

export type BeerAQueueFilter = 'open' | 'overdue';

export interface BeerAStockView extends LabBeerForecast {
  stock: number;
  daysLeft: number | null;
}

const isEnrolledIn = (world: LabBeerWorld, personId: number): boolean =>
  world.enrollments.some(
    (enrollment) => enrollment.personId === personId && enrollment.endedAt === null,
  );

const tabsOf = (world: LabBeerWorld): readonly LabBeerTab[] =>
  world.persons
    .map((person) => tabOf(person.id, world.crates, world.payments))
    .filter((tab) => tab.crates.length > 0);

export const queueOf = (
  world: LabBeerWorld,
  now: string,
  filter: BeerAQueueFilter,
): readonly BeerAQueueRow[] =>
  tabsOf(world)
    .filter((tab) => tab.openCount > 0)
    .map((tab) => {
      const openDays = openDaysOf(tab.oldestOpenAt, now) ?? 0;

      return {
        personId: tab.personId,
        tab,
        openDays,
        overdue: openDays >= REMINDER_AFTER_DAYS,
        enrolled: isEnrolledIn(world, tab.personId),
      };
    })
    .filter((row) => filter === 'open' || row.overdue)
    .sort(
      (left, right) =>
        (left.tab.oldestOpenAt ?? '').localeCompare(right.tab.oldestOpenAt ?? '') ||
        right.tab.openCents - left.tab.openCents,
    );

export const queueCountsOf = (world: LabBeerWorld, now: string): BeerAQueueCounts => {
  const rows = queueOf(world, now, 'open');

  return {
    open: rows.length,
    overdue: rows.filter((row) => row.overdue).length,
    cents: rows.reduce((sum, row) => sum + row.tab.openCents, 0),
  };
};

export const settledOf = (world: LabBeerWorld): readonly BeerASettledRow[] =>
  tabsOf(world)
    .filter((tab) => tab.openCount === 0)
    .map((tab) => ({
      personId: tab.personId,
      paidCount: tab.paidCount,
      lastPaidAt: world.payments
        .filter((payment) => payment.personId === tab.personId)
        .reduce((latest, payment) => (payment.bookedAt > latest ? payment.bookedAt : latest), ''),
    }))
    .sort((left, right) => right.lastPaidAt.localeCompare(left.lastPaidAt));

export const stockViewOf = (world: LabBeerWorld, now: string): BeerAStockView => {
  const stock = stockOf(world.movements, world.crates);
  const forecast = forecastOf(stock, paceOf(world.crates, now), now);

  return {
    ...forecast,
    stock,
    daysLeft:
      forecast.emptyOn === null ? null : (Date.parse(forecast.emptyOn) - Date.parse(now)) / DAY_MS,
  };
};

export const recentMovementsOf = (world: LabBeerWorld): readonly LabBeerStockMovement[] =>
  [...world.movements]
    .sort((left, right) => right.bookedAt.localeCompare(left.bookedAt))
    .slice(0, MOVEMENT_LINES);
