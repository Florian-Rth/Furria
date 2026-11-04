import type { LabBeerOutcome } from '@/features/lab-beer/beer-lab-actions';
import { bookCrates, enroll, isEnrolled } from '@/features/lab-beer/beer-lab-actions';
import { openDaysOf, stockOf, tabOf } from '@/features/lab-beer/beer-lab-ledger';
import type { LabBeerTab, LabBeerTabCrate, LabBeerWorld } from '@/features/lab-beer/beer-lab-types';

export const MAX_CRATES_PER_BOOKING = 3;

export type PourStanding = 'enrolled' | 'former' | 'outside';

export type PourBookingStage = 'book' | 'declare' | 'empty';

export interface PourMember {
  standing: PourStanding;
  tab: LabBeerTab;
  openCrates: readonly LabBeerTabCrate[];
  openDays: number | null;
  stock: number;
  maxCount: number;
}

export const standingOf = (world: LabBeerWorld, personId: number): PourStanding => {
  if (isEnrolled(world, personId)) {
    return 'enrolled';
  }

  return world.enrollments.some((enrollment) => enrollment.personId === personId)
    ? 'former'
    : 'outside';
};

export const maxCountOf = (stock: number): number =>
  Math.max(0, Math.min(MAX_CRATES_PER_BOOKING, stock));

export const memberOf = (world: LabBeerWorld, personId: number): PourMember => {
  const tab = tabOf(personId, world.crates, world.payments);
  const stock = stockOf(world.movements, world.crates);

  return {
    standing: standingOf(world, personId),
    tab,
    openCrates: tab.crates.filter((entry) => entry.paidBy === null),
    openDays: openDaysOf(tab.oldestOpenAt, world.now),
    stock,
    maxCount: maxCountOf(stock),
  };
};

export const bookingStageOf = (member: PourMember): PourBookingStage => {
  if (member.stock < 1) {
    return 'empty';
  }

  return member.standing === 'enrolled' ? 'book' : 'declare';
};

export const openAfterOf = (member: PourMember, count: number, priceCents: number): number =>
  member.tab.openCents + count * priceCents;

export const enrollAndBook = (
  world: LabBeerWorld,
  personId: number,
  count: number,
  at: string,
): LabBeerOutcome => {
  const enrolled = enroll(world, personId, at);

  return enrolled.kind === 'done'
    ? bookCrates(enrolled.world, personId, count, personId, at)
    : enrolled;
};

export const withEmptyStock = (world: LabBeerWorld): LabBeerWorld => {
  const stock = stockOf(world.movements, world.crates);

  if (stock <= 0) {
    return world;
  }

  return {
    ...world,
    movements: [
      ...world.movements,
      {
        id: world.movements.reduce((highest, movement) => Math.max(highest, movement.id), 0) + 1,
        kind: 'correction',
        count: -stock,
        reason: 'miscount',
        bookedById: world.pot.ownerId,
        bookedAt: world.now,
      },
    ],
  };
};

export const bookedCrateIdsOf = (before: LabBeerWorld, after: LabBeerWorld): readonly number[] => {
  const known = new Set(before.crates.map((crate) => crate.id));

  return after.crates.filter((crate) => !known.has(crate.id)).map((crate) => crate.id);
};
