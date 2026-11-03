import {
  countEightsOf,
  countIndexAt,
  countPlaceAt,
  countsBetweenOf,
} from '@furria/studio/count-marks';
import { describe, expect, it } from 'vitest';

const marks = [
  { seconds: 1, count: 7 },
  { seconds: 1.5, count: 8 },
  { seconds: 2, count: 1 },
  { seconds: 2.5, count: 2 },
  { seconds: 3, count: 3 },
  { seconds: 3.5, count: 1 },
];

describe('countEightsOf', () => {
  it('starts a new eight on every count that does not climb', () => {
    expect(countEightsOf(marks)).toEqual([1, 1, 2, 2, 2, 3]);
  });

  it('has no eights without marks', () => {
    expect(countEightsOf([])).toEqual([]);
  });
});

describe('countIndexAt', () => {
  it.each([
    [0.5, -1],
    [1, 0],
    [1.9995, 2],
    [2.2, 2],
    [9, 5],
  ])('at %ss is mark %i', (seconds, index) => {
    expect(countIndexAt(marks, seconds)).toBe(index);
  });
});

describe('countPlaceAt', () => {
  it('names the eight and the count', () => {
    expect(countPlaceAt(marks, countEightsOf(marks), 3.1)).toEqual({ eight: 2, count: 3 });
  });

  it('is empty before the first count', () => {
    expect(countPlaceAt(marks, countEightsOf(marks), 0.2)).toBeNull();
  });
});

describe('countsBetweenOf', () => {
  it.each([
    [1.5, 3, 3],
    [0, 9, 6],
    [3.2, 3.4, 0],
    [3, 2, 0],
  ])('from %ss to %ss holds %i counts', (start, end, counts) => {
    expect(countsBetweenOf(marks, start, end)).toBe(counts);
  });
});
