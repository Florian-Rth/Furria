import { describe, expect, it } from 'vitest';
import { giverLinesOf } from './ledger-givers';

describe('giverLinesOf', () => {
  it('lists givers alphabetically by last name, ignoring undone crates', () => {
    const persons = [
      { id: 1, firstName: 'Sabine', lastName: 'Roth', initials: 'SR' },
      { id: 2, firstName: 'Jana', lastName: 'Kühn', initials: 'JK' },
      { id: 3, firstName: 'Lena', lastName: 'Brandt', initials: 'LB' },
    ];
    const crate = (id: number, personId: number, bookedAt: string, undoneAt: string | null) => ({
      id,
      personId,
      priceCents: 1800,
      enteredById: personId,
      bookedAt,
      undoneAt,
    });

    expect(
      giverLinesOf(
        [
          crate(1, 1, '2026-10-01T18:00:00.000Z', null),
          crate(2, 2, '2026-10-02T18:00:00.000Z', null),
          crate(3, 2, '2026-10-05T18:00:00.000Z', null),
          crate(4, 3, '2026-10-06T18:00:00.000Z', '2026-10-06T18:00:05.000Z'),
        ],
        persons,
      ).map((line) => [line.person.id, line.crateCount, line.lastAt]),
    ).toEqual([
      [2, 2, '2026-10-05T18:00:00.000Z'],
      [1, 1, '2026-10-01T18:00:00.000Z'],
    ]);
  });
});
