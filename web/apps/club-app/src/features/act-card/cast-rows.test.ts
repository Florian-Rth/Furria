import { describe, expect, it } from 'vitest';
import { castRowsOf } from './cast-rows';

const person = (personId: number, firstName: string) => ({
  personId,
  firstName,
  lastName: 'X',
  portrait: null,
});

describe('castRowsOf', () => {
  it('sorts by first name and marks the viewer and the editors', () => {
    const rows = castRowsOf(
      [person(1, 'Sophie'), person(2, 'Lena'), person(3, 'Anna')],
      [person(1, 'Sophie'), person(2, 'Lena')],
      2,
    );

    expect(rows.map((row) => [row.person.personId, row.role])).toEqual([
      [3, 'member'],
      [2, 'self'],
      [1, 'editor'],
    ]);
  });
});
