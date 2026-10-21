import { describe, expect, it } from 'vitest';
import {
  arrivalRunOf,
  countCellsOf,
  countFrameAt,
  markRevealAtOf,
  runEndOf,
  tickRunOf,
  turnedTilesOf,
} from './count-run';

describe('countCellsOf', () => {
  it.each([
    ['22', ['tile', 'tile'], [0, 1]],
    ['10:52', ['tile', 'tile', 'mark', 'tile', 'tile'], [0, 1, null, 2, 3]],
    ['✶', ['tile'], [0]],
  ])('splits %s into tiles and marks', (numeral, kinds, orders) => {
    const cells = countCellsOf(numeral);

    expect(cells.map((cell) => cell.kind)).toEqual(kinds);
    expect(cells.map((cell) => (cell.kind === 'tile' ? cell.order : null))).toEqual(orders);
  });
});

describe('arrivalRunOf', () => {
  it.each([
    ['2', 0, ['', '9', '0', '1', '2']],
    ['7', 1, ['', '3', '4', '5', '6', '7']],
  ])('rolls into %s from a blank tile at order %d', (face, order, expected) => {
    expect(arrivalRunOf(face, order).faces).toEqual(expected);
  });

  it('rolls the star in after the nine', () => {
    expect(arrivalRunOf('✶', 0).faces).toEqual(['', '7', '8', '9', '✶']);
  });

  it.each([
    [0, 0, 560],
    [1, 55, 725],
    [3, 165, 1055],
    [9, 495, 1495],
  ])('starts order %d at %d ms and lands at %d ms', (order, start, end) => {
    const run = arrivalRunOf('5', order);

    expect(run.start).toBe(start);
    expect(runEndOf(run)).toBe(end);
  });
});

describe('countFrameAt', () => {
  const run = arrivalRunOf('2', 1);

  it.each([
    [0, { from: '', to: '', progress: 0 }],
    [55, { from: '', to: '8', progress: 0 }],
    [110, { from: '', to: '8', progress: 0.5 }],
    [220, { from: '8', to: '9', progress: 0.5 }],
    [610, { from: '1', to: '2', progress: 0.5 }],
    [5000, { from: '2', to: '2', progress: 1 }],
  ])('poses the tile at %d ms', (elapsed, frame) => {
    expect(countFrameAt(run, elapsed)).toEqual(frame);
  });

  it('turns a tick from the old face to the new one', () => {
    expect(countFrameAt(tickRunOf('3', '2'), 115)).toEqual({
      from: '3',
      to: '2',
      progress: 0.5,
    });
  });
});

describe('turnedTilesOf', () => {
  it.each([
    ['10:52', '10:51', [false, false, false, false, true]],
    ['10:00', '9:59', null],
    ['22', '21', [false, true]],
    ['22', '22', [false, false]],
  ])('turns the changed tiles from %s to %s', (previous, next, turned) => {
    expect(turnedTilesOf(previous, next)).toEqual(turned);
  });
});

describe('markRevealAtOf', () => {
  it.each([
    ['12.', 2, 725],
    ['1:57', 1, 560],
    ['10:52', 2, 725],
    ['.5', 0, 0],
  ])(
    'reveals the mark of %s at index %d once the tile before it has landed',
    (numeral, index, at) => {
      expect(markRevealAtOf(countCellsOf(numeral), index)).toBe(at);
    },
  );
});
