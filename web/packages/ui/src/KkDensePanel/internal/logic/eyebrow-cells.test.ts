import { describe, expect, it } from 'vitest';
import { eyebrowCellsOf } from './eyebrow-cells';

const turningSlotsOf = (from: string | null, to: string): string[] =>
  eyebrowCellsOf(from, to)
    .filter((cell) => cell.turns)
    .map((cell) => cell.slot);

describe('eyebrowCellsOf', () => {
  it.each([
    ['IN 1:40', 'IN 1:39', ['5', '6']],
    ['IN 1:00', 'IN 0:59', ['3', '5', '6']],
    ['IN 0:01', 'LÄUFT', ['0', '1', '2', '3', '4', '5', '6']],
    ['MO', 'MO', []],
  ])('turns only the cells that change from %s to %s', (from, to, slots) => {
    expect(turningSlotsOf(from, to)).toEqual(slots);
  });

  it('turns nothing when there is no previous text', () => {
    expect(turningSlotsOf(null, 'HEUTE')).toEqual([]);
  });

  it('keeps one cell per character of the longer text and blanks the shorter side', () => {
    expect(eyebrowCellsOf('HEUTE', 'IN 5:59').at(-1)).toEqual({
      slot: '6',
      from: '',
      to: '9',
      turns: true,
    });
    expect(eyebrowCellsOf('IN 0:01', 'LÄUFT').at(-1)).toEqual({
      slot: '6',
      from: '1',
      to: '',
      turns: true,
    });
  });

  it('splits by character, not by code unit', () => {
    expect(eyebrowCellsOf(null, 'LÄUFT').map((cell) => cell.to)).toEqual(['L', 'Ä', 'U', 'F', 'T']);
  });
});
