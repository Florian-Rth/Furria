import { describe, expect, it } from 'vitest';
import { gridStepOf, spotOf } from './season-c-keys';

describe('gridStepOf', () => {
  it.each([
    ['ArrowDown', { row: 2, column: 1 }, { row: 3, column: 1 }],
    ['ArrowDown', { row: 4, column: 1 }, { row: 4, column: 1 }],
    ['ArrowUp', { row: 0, column: 2 }, { row: 0, column: 2 }],
    ['ArrowRight', { row: 1, column: 6 }, { row: 1, column: 6 }],
    ['ArrowLeft', { row: 1, column: 3 }, { row: 1, column: 2 }],
    ['Home', { row: 1, column: 3 }, { row: 1, column: 0 }],
    ['End', { row: 1, column: 3 }, { row: 1, column: 6 }],
    ['Enter', { row: 1, column: 3 }, null],
  ])('moves %s from %o to %o', (key, from, to) => {
    expect(gridStepOf(key, from, 5, 7)).toEqual(to);
  });

  it('does nothing in an empty grid', () => {
    expect(gridStepOf('ArrowDown', { row: 0, column: 0 }, 0, 7)).toBeNull();
  });
});

describe('spotOf', () => {
  it.each([
    ['3:4', { row: 3, column: 4 }],
    ['x', null],
    [undefined, null],
  ])('reads %s', (key, spot) => {
    expect(spotOf(key)).toEqual(spot);
  });
});
