import { describe, expect, it } from 'vitest';
import type { KkPressRulerMark } from '../../press-ruler-data';
import { columnsOf, nearestColumnOf, steppedColumnOf } from './ruler-columns';

const mark = (id: string, share: number, state: KkPressRulerMark['state'] = 'aligned') => ({
  id,
  state,
  share,
  day: id,
  dayLabel: id,
  title: id,
});

describe('columnsOf', () => {
  it('merges marks closer than the gap into one column at the first x', () => {
    const columns = columnsOf([mark('b', 0.51), mark('a', 0.5), mark('c', 0.6)], 200, 4);

    expect(columns.map((column) => [column.x, column.marks.map((m) => m.id)])).toEqual([
      [100, ['a', 'b']],
      [120, ['c']],
    ]);
  });

  it('stacks pending changes on top of withdrawn on top of live', () => {
    const columns = columnsOf(
      [mark('p', 0.5, 'shifted'), mark('l', 0.5), mark('w', 0.5, 'struck')],
      100,
      4,
    );

    expect(columns[0]?.marks.map((m) => m.id)).toEqual(['l', 'w', 'p']);
  });
});

describe('nearestColumnOf', () => {
  const columns = columnsOf([mark('a', 0.1), mark('b', 0.5)], 100, 4);

  it.each([
    { x: 12, expected: 'a' },
    { x: 44, expected: 'b' },
    { x: 30, expected: null },
  ])('picks $expected for x $x', ({ x, expected }) => {
    expect(nearestColumnOf(columns, x, 16)?.marks[0]?.id ?? null).toBe(expected);
  });
});

describe('steppedColumnOf', () => {
  const columns = columnsOf([mark('a', 0.1), mark('b', 0.5), mark('c', 0.9)], 100, 4);

  it.each([
    { current: null, step: 1 as const, expected: 'a' },
    { current: null, step: -1 as const, expected: 'c' },
    { current: 1, step: 1 as const, expected: 'c' },
    { current: 2, step: 1 as const, expected: 'c' },
    { current: 0, step: -1 as const, expected: 'a' },
  ])('steps $step from $current to $expected', ({ current, step, expected }) => {
    const from = current === null ? null : (columns[current] ?? null);

    expect(steppedColumnOf(columns, from, step)?.marks[0]?.id).toBe(expected);
  });
});
