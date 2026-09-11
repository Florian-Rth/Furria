import { describe, expect, it } from 'vitest';
import { toLetterIndexCells } from './letter-index-cells';

const register = [
  { letter: 'A', enabled: true },
  { letter: 'B', enabled: false },
  { letter: 'C', enabled: true },
];

describe('toLetterIndexCells', () => {
  it('marks the letter that is currently in view', () => {
    expect(toLetterIndexCells(register, 'C')).toEqual([
      { letter: 'A', disabled: false, selected: false },
      { letter: 'B', disabled: true, selected: false },
      { letter: 'C', disabled: false, selected: true },
    ]);
  });

  it('never marks a letter nobody is filed under', () => {
    const cells = toLetterIndexCells(register, 'B');

    expect(cells.every((cell) => !cell.selected)).toBe(true);
  });

  it('selects nothing while no letter is in view', () => {
    expect(toLetterIndexCells(register, undefined).some((cell) => cell.selected)).toBe(false);
  });

  it('keeps the register in the order it was given', () => {
    expect(toLetterIndexCells(register, 'A').map((cell) => cell.letter)).toEqual(['A', 'B', 'C']);
  });
});
