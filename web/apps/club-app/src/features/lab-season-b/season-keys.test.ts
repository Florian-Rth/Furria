import { describe, expect, it } from 'vitest';
import { gridMoveOf, nextGridKeyOf } from './season-keys';

const grid = [['a1', 'a2', 'a3'], ['b1'], [], ['d1', 'd2', 'd3', 'd4']];

describe('nextGridKeyOf', () => {
  it.each([
    ['moves down a column', 'a1', 'down', 'a2'],
    ['stops at the column end', 'a3', 'down', null],
    ['moves up a column', 'a2', 'up', 'a1'],
    ['stops at the column top', 'a1', 'up', null],
    ['jumps to the column start', 'd3', 'first', 'd1'],
    ['jumps to the column end', 'd1', 'last', 'd4'],
    ['keeps the row when stepping right', 'a1', 'right', 'b1'],
    ['clamps to a shorter column', 'a3', 'right', 'b1'],
    ['skips an empty column', 'b1', 'right', 'd1'],
    ['skips an empty column going left', 'd4', 'left', 'b1'],
    ['stops at the first column', 'a2', 'left', null],
    ['stops at the last column', 'd2', 'right', null],
    ['ignores an unknown key', 'x9', 'down', null],
  ] as const)('%s', (_name, current, move, expected) => {
    expect(nextGridKeyOf(grid, current, move)).toBe(expected);
  });
});

describe('gridMoveOf', () => {
  it.each([
    ['ArrowRight', 'right'],
    ['Home', 'first'],
    ['Enter', null],
  ] as const)('reads %s', (key, move) => {
    expect(gridMoveOf(key)).toBe(move);
  });
});
