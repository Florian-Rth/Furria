import { describe, expect, it } from 'vitest';
import { toInitials } from './initials';

describe('toInitials', () => {
  it.each([
    ['Furria', 'Admin', 'FA'],
    ['marie', 'schulz', 'MS'],
    ['  Bert  ', '  Ostmann  ', 'BO'],
    ['Ötke', 'Ärgel', 'ÖÄ'],
    ['', 'Schulz', 'S'],
    ['Marie', '', 'M'],
    ['', '', ''],
    ['   ', '   ', ''],
  ])('turns %s %s into %s', (firstName, lastName, expected) => {
    expect(toInitials(firstName, lastName)).toBe(expected);
  });
});
