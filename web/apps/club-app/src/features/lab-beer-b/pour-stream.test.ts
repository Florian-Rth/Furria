import { describe, expect, it } from 'vitest';
import type { LabBeerWorld } from '@/features/lab-beer/beer-lab-types';
import { streamOf } from './pour-stream';

const world: LabBeerWorld = {
  now: '2026-11-04T19:00:00.000Z',
  pot: {
    id: 1,
    ownerId: 1,
    priceCents: 1800,
    paymentLink: null,
    paymentNote: null,
    openedAt: '2026-10-01T18:00:00.000Z',
    bookingPath: '/b',
  },
  persons: [],
  operatorIds: [1],
  enrollments: [
    { personId: 3, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    { personId: 4, startedAt: '2026-10-01T18:00:00.000Z', endedAt: null, endedById: null },
    {
      personId: 10,
      startedAt: '2026-10-01T18:00:00.000Z',
      endedAt: '2026-10-20T18:00:00.000Z',
      endedById: 1,
    },
  ],
  crates: [
    {
      id: 1,
      personId: 3,
      priceCents: 1700,
      enteredById: 3,
      bookedAt: '2026-10-02T19:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 2,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-03T19:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 3,
      personId: 3,
      priceCents: 1800,
      enteredById: 3,
      bookedAt: '2026-11-03T19:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 4,
      personId: 4,
      priceCents: 1800,
      enteredById: 1,
      bookedAt: '2026-11-04T18:00:00.000Z',
      undoneAt: null,
    },
    {
      id: 5,
      personId: 4,
      priceCents: 1800,
      enteredById: 4,
      bookedAt: '2026-11-04T18:30:00.000Z',
      undoneAt: '2026-11-04T18:30:05.000Z',
    },
    {
      id: 6,
      personId: 10,
      priceCents: 1700,
      enteredById: 10,
      bookedAt: '2026-10-05T19:00:00.000Z',
      undoneAt: null,
    },
  ],
  payments: [
    { id: 1, personId: 3, crateCount: 2, bookedById: 1, bookedAt: '2026-11-04T17:00:00.000Z' },
  ],
  movements: [],
};

const personIdsOf = (viewerId: number, filter: 'all' | 'mine'): readonly number[] =>
  streamOf(world, viewerId, filter)
    .flatMap((day) => day.entries)
    .flatMap((entry) => (entry.kind === 'crates' ? [entry.personId] : []));

describe('streamOf', () => {
  it('groups one booking into one entry per day, newest first, without undone crates', () => {
    const days = streamOf(world, 3, 'all');

    expect(days.map((day) => [day.dayKey, day.crateCount])).toEqual([
      ['2026-11-04', 1],
      ['2026-11-03', 2],
      ['2026-10-05', 1],
      ['2026-10-02', 1],
    ]);
    expect(days[0]?.entries.map((entry) => entry.kind)).toEqual(['crates', 'settle']);
  });

  it('marks own crates by settlement state and names who entered someone else’s crate', () => {
    const entries = streamOf(world, 3, 'all').flatMap((day) => day.entries);

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ personId: 4, own: false, state: null, enteredById: 1 }),
        expect.objectContaining({ personId: 3, count: 2, own: true, state: 'part' }),
        expect.objectContaining({ personId: 3, count: 1, own: true, state: 'paid' }),
        expect.objectContaining({ kind: 'settle', crateCount: 2, cents: 3500 }),
      ]),
    );
  });

  it.each([
    [3, 'mine', [3, 3]],
    [10, 'all', [10]],
  ] as const)('limits viewer %i with filter %s to own entries', (viewerId, filter, expected) => {
    expect(personIdsOf(viewerId, filter)).toEqual(expected);
  });
});
