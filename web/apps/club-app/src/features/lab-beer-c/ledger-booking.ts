import { isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import { stockOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerTab, LabBeerTabCrate, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';

export const MAX_COUNT = 3;

export type BookingStance = 'book' | 'empty' | 'declare' | 'former';

export interface BookingPreview {
  sumCents: number;
  afterCents: number;
}

export interface SettlementPreview {
  crates: readonly LabBeerTabCrate[];
  cents: number;
  remainingCount: number;
}

export const bookingStanceOf = (world: LabBeerWorld, personId: number): BookingStance => {
  if (isEnrolled(world, personId)) {
    return stockOf(world.movements, world.crates) > 0 ? 'book' : 'empty';
  }

  return world.enrollments.some((enrollment) => enrollment.personId === personId)
    ? 'former'
    : 'declare';
};

export const countLimitOf = (stock: number): number => Math.max(0, Math.min(MAX_COUNT, stock));

export const clampCount = (count: number, limit: number): number =>
  Math.max(Math.min(1, limit), Math.min(count, limit));

export const bookingPreviewOf = (
  priceCents: number,
  count: number,
  openCents: number,
): BookingPreview => ({
  sumCents: priceCents * count,
  afterCents: openCents + priceCents * count,
});

export const bookedIdsOf = (world: LabBeerWorld, count: number): readonly number[] => {
  const next = world.crates.reduce((highest, crate) => Math.max(highest, crate.id), 0) + 1;

  return Array.from({ length: count }, (_, index) => next + index);
};

export const settlementOf = (tab: LabBeerTab, count: number): SettlementPreview => {
  const crates = tab.crates.filter((entry) => entry.paidBy === null).slice(0, Math.max(0, count));

  return {
    crates,
    cents: crates.reduce((sum, entry) => sum + entry.crate.priceCents, 0),
    remainingCount: tab.openCount - crates.length,
  };
};

export const secondsLeftOf = (bookedAt: string, now: string, windowMs: number): number =>
  Math.max(0, Math.ceil((Date.parse(bookedAt) + windowMs - Date.parse(now)) / 1000));
