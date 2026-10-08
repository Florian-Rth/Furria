import { describe, expect, it } from 'vitest';
import { toLetterIndexCells } from './letter-index-cells';

const register = [
  { letter: 'A', enabled: true },
  { letter: 'B', enabled: false },
];

describe('toLetterIndexCells', () => {
  it.each([
    { current: 'A', currents: [true, false] },
    { current: 'B', currents: [false, false] },
    { current: undefined, currents: [false, false] },
  ])(
    'marks only an enabled letter in view as current with $current in view',
    ({ current, currents }) => {
      expect(toLetterIndexCells(register, current).map((cell) => cell.current)).toEqual(currents);
    },
  );
});
