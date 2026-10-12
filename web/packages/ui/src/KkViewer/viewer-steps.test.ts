import { describe, expect, it } from 'vitest';
import { filmstripWindowOf, neighboursOf, preloadPlanOf, steppedIndexOf } from './viewer-steps';

describe('neighboursOf', () => {
  it.each([
    [5, 12, [4, 5, 6]],
    [0, 12, [0, 1]],
    [11, 12, [10, 11]],
    [0, 1, [0]],
  ])('frames index %i of %i with the indices %j', (index, count, indices) => {
    expect(neighboursOf(index, count).map((neighbour) => neighbour.index)).toEqual(indices);
  });

  it('places the previous frame left and the next frame right of the current one', () => {
    expect(neighboursOf(5, 12).map((neighbour) => [neighbour.slot, neighbour.offset])).toEqual([
      ['previous', -1],
      ['current', 0],
      ['next', 1],
    ]);
  });
});

describe('steppedIndexOf', () => {
  it.each([
    [5, 1, 12, 6],
    [5, -1, 12, 4],
    [0, -1, 12, null],
    [11, 1, 12, null],
    [3, 4, 12, 7],
    [3, 0, 12, null],
  ])('steps from %i by %i of %i to %s', (index, delta, count, stepped) => {
    expect(steppedIndexOf(index, delta, count)).toBe(stepped);
  });
});

describe('preloadPlanOf', () => {
  it.each([
    [5, 12, 2, [6, 4, 7, 3]],
    [0, 12, 2, [1, 2]],
    [11, 12, 2, [10, 9]],
    [0, 1, 2, []],
    [5, 12, 1, [6, 4]],
  ])('plans index %i of %i with reach %i as %j', (index, count, reach, plan) => {
    expect(preloadPlanOf(index, count, reach)).toEqual(plan);
  });
});

describe('filmstripWindowOf', () => {
  it.each([
    [20, 60, 12, { start: 8, end: 33 }],
    [2, 60, 12, { start: 0, end: 25 }],
    [58, 60, 12, { start: 35, end: 60 }],
    [3, 7, 12, { start: 0, end: 7 }],
  ])('windows index %i of %i with reach %i as %j', (index, count, reach, window) => {
    expect(filmstripWindowOf(index, count, reach)).toEqual(window);
  });
});
