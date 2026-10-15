import { describe, expect, it } from 'vitest';
import type { KkPressRulerLane } from '../../press-ruler-data';
import { rulerPressOf } from './ruler-press';

const lane = (key: string, count: number): KkPressRulerLane => ({
  key,
  yearLabel: key,
  numberLabel: '',
  count,
  present: false,
  marks: Array.from({ length: count }, (_, index) => ({
    id: `${key}${index}`,
    state: 'aligned' as const,
    share: 0,
    day: '',
    dayLabel: '',
    title: '',
  })),
  festStart: 0,
  roseMonday: 0,
  summerStart: 0,
  seasonTicks: [],
  summerTicks: [],
  dayLabelAt: () => '',
});

describe('rulerPressOf', () => {
  it('presses the oldest lane first', () => {
    const press = rulerPressOf([lane('now', 2), lane('last', 3)]);

    expect([press.firstOf('last'), press.firstOf('now')]).toEqual([0, 3]);
  });

  it.each([
    { total: 10, index: 9, expected: 528 },
    { total: 100, index: 99, expected: 935 },
  ])('fits $total marks into the press run', ({ total, index, expected }) => {
    expect(rulerPressOf([lane('now', total)]).delayOf(index)).toBe(expected);
  });
});
