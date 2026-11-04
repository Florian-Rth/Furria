import { isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import {
  forecastOf,
  isReminderDue,
  liveCratesOf,
  openDaysOf,
  PACE_WINDOW_DAYS,
  paceOf,
  stockOf,
  tabOf,
} from '@/features/lab-beer/beer-lab-ledger';
import type {
  LabBeerForecast,
  LabBeerPerson,
  LabBeerStockMovement,
  LabBeerWorld,
} from '@/features/lab-beer/beer-lab-types';

export type Participation = 'running' | 'ended' | 'none';

export type HubFilter = 'all' | 'open' | 'overdue' | 'running';

export type HubSort = 'open' | 'oldest' | 'name';

export type RowState = 'ended' | 'overdue' | 'open' | 'clear' | 'fresh';

export interface PersonLine {
  person: LabBeerPerson;
  participation: Participation;
  openCount: number;
  openCents: number;
  paidCount: number;
  oldestOpenAt: string | null;
  openDays: number | null;
  overdue: boolean;
}

export interface HubHealth {
  stock: number;
  fillShare: number;
  forecast: LabBeerForecast;
  windowCrates: number;
  openCents: number;
  openPeople: number;
  overdueCount: number;
  runningCount: number;
  endedCount: number;
}

export interface StockLine {
  movement: LabBeerStockMovement;
  stockAfter: number;
}

const participationOf = (world: LabBeerWorld, personId: number): Participation => {
  if (isEnrolled(world, personId)) {
    return 'running';
  }

  return world.enrollments.some((enrollment) => enrollment.personId === personId)
    ? 'ended'
    : 'none';
};

export const peopleOf = (world: LabBeerWorld): readonly PersonLine[] =>
  world.persons
    .map((person) => {
      const tab = tabOf(person.id, world.crates, world.payments);

      return {
        person,
        participation: participationOf(world, person.id),
        openCount: tab.openCount,
        openCents: tab.openCents,
        paidCount: tab.paidCount,
        oldestOpenAt: tab.oldestOpenAt,
        openDays: openDaysOf(tab.oldestOpenAt, world.now),
        overdue: isReminderDue(tab.oldestOpenAt, world.now),
      };
    })
    .filter((line) => line.participation !== 'none' || line.openCount + line.paidCount > 0);

export const passesFilter = (line: PersonLine, filter: HubFilter): boolean => {
  switch (filter) {
    case 'all':
      return true;
    case 'open':
      return line.openCount > 0;
    case 'overdue':
      return line.overdue;
    case 'running':
      return line.participation === 'running';
  }
};

const byName = (left: PersonLine, right: PersonLine): number =>
  `${left.person.lastName} ${left.person.firstName}`.localeCompare(
    `${right.person.lastName} ${right.person.firstName}`,
    'de',
  );

const byOldest = (left: PersonLine, right: PersonLine): number => {
  if (left.oldestOpenAt === right.oldestOpenAt) {
    return byName(left, right);
  }

  if (left.oldestOpenAt === null) {
    return 1;
  }

  return right.oldestOpenAt === null ? -1 : left.oldestOpenAt.localeCompare(right.oldestOpenAt);
};

const byOpen = (left: PersonLine, right: PersonLine): number =>
  right.openCents - left.openCents || byOldest(left, right);

const SORTS: Record<HubSort, (left: PersonLine, right: PersonLine) => number> = {
  open: byOpen,
  oldest: byOldest,
  name: byName,
};

export const tableOf = (
  lines: readonly PersonLine[],
  filter: HubFilter,
  sort: HubSort,
): readonly PersonLine[] => lines.filter((line) => passesFilter(line, filter)).sort(SORTS[sort]);

const stockAt = (world: LabBeerWorld, at: string): number =>
  world.movements
    .filter((movement) => movement.bookedAt <= at)
    .reduce((sum, movement) => sum + movement.count, 0) -
  liveCratesOf(world.crates).filter((crate) => crate.bookedAt <= at).length;

export const stockLinesOf = (world: LabBeerWorld): readonly StockLine[] =>
  [...world.movements]
    .sort((left, right) => right.bookedAt.localeCompare(left.bookedAt))
    .map((movement) => ({ movement, stockAfter: stockAt(world, movement.bookedAt) }));

export const fillShareOf = (world: LabBeerWorld, stock: number): number => {
  const lastDelivery = [...world.movements]
    .filter((movement) => movement.kind === 'delivery')
    .sort((left, right) => right.bookedAt.localeCompare(left.bookedAt))[0];

  if (lastDelivery === undefined) {
    return stock > 0 ? 1 : 0;
  }

  const full = stockAt(world, lastDelivery.bookedAt);

  return full <= 0 ? 0 : Math.min(1, Math.max(0, stock / full));
};

export const hubHealthOf = (world: LabBeerWorld): HubHealth => {
  const stock = stockOf(world.movements, world.crates);
  const pace = paceOf(world.crates, world.now);
  const lines = peopleOf(world);

  return {
    stock,
    fillShare: fillShareOf(world, stock),
    forecast: forecastOf(stock, pace, world.now),
    windowCrates: Math.round(pace * PACE_WINDOW_DAYS),
    openCents: lines.reduce((sum, line) => sum + line.openCents, 0),
    openPeople: lines.filter((line) => line.openCount > 0).length,
    overdueCount: lines.filter((line) => line.overdue).length,
    runningCount: lines.filter((line) => line.participation === 'running').length,
    endedCount: lines.filter((line) => line.participation === 'ended').length,
  };
};

export const rowStateOf = (line: PersonLine): RowState => {
  if (line.participation === 'ended') {
    return 'ended';
  }

  if (line.overdue) {
    return 'overdue';
  }

  if (line.openCount > 0) {
    return 'open';
  }

  return line.paidCount > 0 ? 'clear' : 'fresh';
};
