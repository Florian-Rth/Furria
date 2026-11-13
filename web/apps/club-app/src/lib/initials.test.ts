import { describe, expect, it } from 'vitest';
import { groupInitialsOf, toInitials } from './initials';

describe('toInitials', () => {
  it.each([
    ['marie', 'schulz', 'MS'],
    ['  Bert  ', '  Ostmann  ', 'BO'],
    ['', 'Schulz', 'S'],
    ['   ', '   ', ''],
  ])('turns %s %s into %s', (firstName, lastName, expected) => {
    expect(toInitials(firstName, lastName)).toBe(expected);
  });
});

describe('groupInitialsOf', () => {
  it.each([
    ['Große Garde', 'GG'],
    ['die 3 Tollitäten', 'D3'],
    ['Elferrat', 'E'],
  ])('reads %s as %s', (name, initials) => {
    expect(groupInitialsOf(name)).toBe(initials);
  });
});
