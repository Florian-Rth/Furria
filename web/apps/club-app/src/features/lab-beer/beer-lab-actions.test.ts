import { describe, expect, it } from 'vitest';
import { bookCorrection, bookCrates, bookPayment, undoCrates } from './beer-lab-actions';
import type { LabBeerWorld } from './beer-lab-types';

const AT = '2026-11-04T19:00:00.000Z';

const worldOf = (stock: number): LabBeerWorld => ({
  now: AT,
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-09-01T10:00:00.000Z',
    bookingPath: '/beer-list/book',
  },
  persons: [],
  operatorIds: [1],
  enrollments: [
    { personId: 3, startedAt: '2026-09-01T10:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 4,
      startedAt: '2026-09-01T10:00:00.000Z',
      endedAt: '2026-10-01T10:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    {
      id: 1,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-04T18:59:55.000Z',
      undoneAt: null,
    },
    {
      id: 2,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-03T18:00:00.000Z',
      undoneAt: null,
    },
  ],
  payments: [],
  movements: [
    {
      id: 1,
      kind: 'delivery',
      count: stock + 2,
      reason: null,
      bookedById: 1,
      bookedAt: '2026-09-01T10:00:00.000Z',
    },
  ],
});

const refusalOf = (outcome: ReturnType<typeof bookCrates>): string | null =>
  outcome.kind === 'refused' ? outcome.refusal : null;

describe('bookCrates', () => {
  it.each([
    { personId: 3, count: 2, enteredById: 3, stock: 5, refusal: null },
    { personId: 3, count: 4, enteredById: 3, stock: 5, refusal: 'countOutOfRange' },
    { personId: 3, count: 3, enteredById: 3, stock: 2, refusal: 'outOfStock' },
    { personId: 4, count: 1, enteredById: 4, stock: 5, refusal: 'notEnrolled' },
    { personId: 4, count: 1, enteredById: 1, stock: 5, refusal: null },
  ])('books $count for $personId by $enteredById at stock $stock → $refusal', (row) => {
    const outcome = bookCrates(worldOf(row.stock), row.personId, row.count, row.enteredById, AT);

    expect(refusalOf(outcome)).toBe(row.refusal);
  });
});

describe('undoCrates', () => {
  it.each([
    { crateId: 1, by: 3, refusal: null },
    { crateId: 2, by: 3, refusal: 'undoWindowClosed' },
    { crateId: 1, by: 5, refusal: 'notTheBooker' },
    { crateId: 2, by: 1, refusal: null },
  ])('undoes crate $crateId by $by → $refusal', ({ crateId, by, refusal }) => {
    expect(refusalOf(undoCrates(worldOf(5), [crateId], by, AT))).toBe(refusal);
  });
});

describe('bookPayment', () => {
  it.each([
    { count: 2, refusal: null },
    { count: 3, refusal: 'moreThanOpen' },
    { count: 0, refusal: 'moreThanOpen' },
  ])('settles $count crates → $refusal', ({ count, refusal }) => {
    expect(refusalOf(bookPayment(worldOf(5), 3, count, 1, AT))).toBe(refusal);
  });
});

describe('bookCorrection', () => {
  it.each([
    { count: -5, refusal: null },
    { count: -6, refusal: 'outOfStock' },
    { count: 0, refusal: 'countOutOfRange' },
  ])('corrects by $count → $refusal', ({ count, refusal }) => {
    expect(refusalOf(bookCorrection(worldOf(5), count, 'shrinkage', 1, AT))).toBe(refusal);
  });
});
