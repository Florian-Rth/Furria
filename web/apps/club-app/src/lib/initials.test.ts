import { describe, expect, it } from 'vitest';
import { toInitials } from './initials';

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
