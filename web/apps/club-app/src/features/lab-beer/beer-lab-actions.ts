import { stockOf, tabOf, UNDO_WINDOW_MS } from './beer-lab-ledger';
import type { LabBeerCorrectionReason, LabBeerCrate, LabBeerWorld } from './beer-lab-types';

export type LabBeerRefusal =
  | 'notEnrolled'
  | 'outOfStock'
  | 'countOutOfRange'
  | 'moreThanOpen'
  | 'undoWindowClosed'
  | 'notTheBooker'
  | 'notAffiliated';

export type LabBeerOutcome =
  | { kind: 'done'; world: LabBeerWorld }
  | { kind: 'refused'; refusal: LabBeerRefusal };

const MAX_CRATES_PER_BOOKING = 3;

const nextIdOf = (items: readonly { id: number }[]): number =>
  items.reduce((highest, item) => Math.max(highest, item.id), 0) + 1;

export const isEnrolled = (world: LabBeerWorld, personId: number): boolean =>
  world.enrollments.some(
    (enrollment) => enrollment.personId === personId && enrollment.endedAt === null,
  );

export const isOperator = (world: LabBeerWorld, personId: number): boolean =>
  world.operatorIds.includes(personId);

export const bookCrates = (
  world: LabBeerWorld,
  personId: number,
  count: number,
  enteredById: number,
  at: string,
): LabBeerOutcome => {
  if (count < 1 || count > MAX_CRATES_PER_BOOKING) {
    return { kind: 'refused', refusal: 'countOutOfRange' };
  }

  if (!isEnrolled(world, personId) && !isOperator(world, enteredById)) {
    return { kind: 'refused', refusal: 'notEnrolled' };
  }

  if (stockOf(world.movements, world.crates) < count) {
    return { kind: 'refused', refusal: 'outOfStock' };
  }

  const firstId = nextIdOf(world.crates);
  const booked: LabBeerCrate[] = Array.from({ length: count }, (_, index) => ({
    id: firstId + index,
    personId,
    priceCents: world.pot.priceCents,
    enteredById,
    bookedAt: at,
    undoneAt: null,
  }));

  return { kind: 'done', world: { ...world, crates: [...world.crates, ...booked] } };
};

export const undoCrates = (
  world: LabBeerWorld,
  crateIds: readonly number[],
  undoneById: number,
  at: string,
): LabBeerOutcome => {
  const targets = world.crates.filter((crate) => crateIds.includes(crate.id));
  const operator = isOperator(world, undoneById);

  if (!operator && targets.some((crate) => crate.enteredById !== undoneById)) {
    return { kind: 'refused', refusal: 'notTheBooker' };
  }

  if (
    !operator &&
    targets.some((crate) => Date.parse(at) - Date.parse(crate.bookedAt) > UNDO_WINDOW_MS)
  ) {
    return { kind: 'refused', refusal: 'undoWindowClosed' };
  }

  return {
    kind: 'done',
    world: {
      ...world,
      crates: world.crates.map((crate) =>
        crateIds.includes(crate.id) ? { ...crate, undoneAt: at } : crate,
      ),
    },
  };
};

export const bookPayment = (
  world: LabBeerWorld,
  personId: number,
  crateCount: number,
  bookedById: number,
  at: string,
): LabBeerOutcome => {
  const tab = tabOf(personId, world.crates, world.payments);

  if (crateCount < 1 || crateCount > tab.openCount) {
    return { kind: 'refused', refusal: 'moreThanOpen' };
  }

  return {
    kind: 'done',
    world: {
      ...world,
      payments: [
        ...world.payments,
        { id: nextIdOf(world.payments), personId, crateCount, bookedById, bookedAt: at },
      ],
    },
  };
};

export const bookDelivery = (
  world: LabBeerWorld,
  count: number,
  bookedById: number,
  at: string,
): LabBeerOutcome =>
  count < 1
    ? { kind: 'refused', refusal: 'countOutOfRange' }
    : {
        kind: 'done',
        world: {
          ...world,
          movements: [
            ...world.movements,
            {
              id: nextIdOf(world.movements),
              kind: 'delivery',
              count,
              reason: null,
              bookedById,
              bookedAt: at,
            },
          ],
        },
      };

export const bookCorrection = (
  world: LabBeerWorld,
  count: number,
  reason: LabBeerCorrectionReason,
  bookedById: number,
  at: string,
): LabBeerOutcome => {
  if (count === 0) {
    return { kind: 'refused', refusal: 'countOutOfRange' };
  }

  if (stockOf(world.movements, world.crates) + count < 0) {
    return { kind: 'refused', refusal: 'outOfStock' };
  }

  return {
    kind: 'done',
    world: {
      ...world,
      movements: [
        ...world.movements,
        {
          id: nextIdOf(world.movements),
          kind: 'correction',
          count,
          reason,
          bookedById,
          bookedAt: at,
        },
      ],
    },
  };
};

export const enroll = (world: LabBeerWorld, personId: number, at: string): LabBeerOutcome =>
  isEnrolled(world, personId)
    ? { kind: 'done', world }
    : {
        kind: 'done',
        world: {
          ...world,
          enrollments: [
            ...world.enrollments,
            { personId, startedAt: at, endedAt: null, endedById: null },
          ],
        },
      };

export const endEnrollment = (
  world: LabBeerWorld,
  personId: number,
  endedById: number,
  at: string,
): LabBeerOutcome => ({
  kind: 'done',
  world: {
    ...world,
    enrollments: world.enrollments.map((enrollment) =>
      enrollment.personId === personId && enrollment.endedAt === null
        ? { ...enrollment, endedAt: at, endedById }
        : enrollment,
    ),
  },
});
