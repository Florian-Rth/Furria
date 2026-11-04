import type {
  LabBeerCrate,
  LabBeerForecast,
  LabBeerGiver,
  LabBeerPayment,
  LabBeerStockMovement,
  LabBeerTab,
  LabBeerTabCrate,
} from './beer-lab-types';

const DAY_MS = 86_400_000;

export const PACE_WINDOW_DAYS = 21;
export const WARNING_HORIZON_DAYS = 7;
export const REMINDER_AFTER_DAYS = 7;
export const UNDO_WINDOW_MS = 10_000;

const byTime = <T extends { bookedAt: string }>(left: T, right: T): number =>
  Date.parse(left.bookedAt) - Date.parse(right.bookedAt);

export const liveCratesOf = (crates: readonly LabBeerCrate[]): readonly LabBeerCrate[] =>
  crates.filter((crate) => crate.undoneAt === null);

const settledCratesOf = (
  crates: readonly LabBeerCrate[],
  payments: readonly LabBeerPayment[],
): readonly LabBeerTabCrate[] => {
  const ordered = [...liveCratesOf(crates)].sort(byTime);
  const payers = [...payments]
    .sort(byTime)
    .flatMap((payment) => Array.from({ length: payment.crateCount }, () => payment));

  return ordered.map((crate, index) => ({ crate, paidBy: payers[index] ?? null }));
};

export const tabOf = (
  personId: number,
  crates: readonly LabBeerCrate[],
  payments: readonly LabBeerPayment[],
): LabBeerTab => {
  const settled = settledCratesOf(
    crates.filter((crate) => crate.personId === personId),
    payments.filter((payment) => payment.personId === personId),
  );
  const open = settled.filter((entry) => entry.paidBy === null);

  return {
    personId,
    crates: settled,
    openCount: open.length,
    openCents: open.reduce((sum, entry) => sum + entry.crate.priceCents, 0),
    paidCount: settled.length - open.length,
    oldestOpenAt: open[0]?.crate.bookedAt ?? null,
  };
};

export const stockOf = (
  movements: readonly LabBeerStockMovement[],
  crates: readonly LabBeerCrate[],
): number =>
  movements.reduce((sum, movement) => sum + movement.count, 0) - liveCratesOf(crates).length;

export const paceOf = (crates: readonly LabBeerCrate[], now: string): number => {
  const from = Date.parse(now) - PACE_WINDOW_DAYS * DAY_MS;
  const recent = liveCratesOf(crates).filter((crate) => Date.parse(crate.bookedAt) > from);

  return recent.length / PACE_WINDOW_DAYS;
};

export const forecastOf = (stock: number, pacePerDay: number, now: string): LabBeerForecast => {
  if (pacePerDay <= 0) {
    return { pacePerDay, emptyOn: null, warns: false };
  }

  const daysLeft = stock / pacePerDay;

  return {
    pacePerDay,
    emptyOn: new Date(Date.parse(now) + daysLeft * DAY_MS).toISOString(),
    warns: daysLeft <= WARNING_HORIZON_DAYS,
  };
};

export const openDaysOf = (oldestOpenAt: string | null, now: string): number | null =>
  oldestOpenAt === null ? null : Math.floor((Date.parse(now) - Date.parse(oldestOpenAt)) / DAY_MS);

export const isReminderDue = (oldestOpenAt: string | null, now: string): boolean =>
  (openDaysOf(oldestOpenAt, now) ?? 0) >= REMINDER_AFTER_DAYS;

export const giversOf = (crates: readonly LabBeerCrate[]): readonly LabBeerGiver[] => {
  const givers = new Map<number, LabBeerGiver>();

  for (const crate of liveCratesOf(crates)) {
    const known = givers.get(crate.personId);
    givers.set(crate.personId, {
      personId: crate.personId,
      crateCount: (known?.crateCount ?? 0) + 1,
      lastAt: known === undefined || crate.bookedAt > known.lastAt ? crate.bookedAt : known.lastAt,
    });
  }

  return [...givers.values()].sort((left, right) => right.lastAt.localeCompare(left.lastAt));
};

const EURO = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

export const euroOf = (cents: number): string => EURO.format(cents / 100);
