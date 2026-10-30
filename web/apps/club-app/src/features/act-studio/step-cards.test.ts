import { describe, expect, it } from 'vitest';
import {
  countEightsOf,
  countIndexAt,
  countPlaceAt,
  countSheetOf,
  countsBetweenOf,
  neighbourCountOf,
  stepCardKeyOf,
  stepCountCellsOf,
} from './step-cards';

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

describe('neighbourCountOf', () => {
  it.each([
    [2, 1, 2.5],
    [2, -1, 1.5],
    [2.2, -1, 2],
    [3.5, 1, null],
    [1, -1, null],
  ] as const)('from %ss towards %i lands on %s', (seconds, direction, target) => {
    expect(neighbourCountOf(marks, seconds, direction)).toBe(target);
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

describe('stepCountCellsOf', () => {
  it('lays the step counts into their columns and marks the keyed ones', () => {
    expect(stepCountCellsOf(countSheetOf(marks, [2.6, 9]), { start: 2, end: 3.5 })).toEqual([
      { key: '2', index: 2, column: 0, count: 1, eight: 2, seconds: 2, keyed: false },
      { key: '3', index: 3, column: 1, count: 2, eight: 2, seconds: 2.5, keyed: true },
      { key: '4', index: 4, column: 2, count: 3, eight: 2, seconds: 3, keyed: false },
    ]);
  });

  it('has no cells for a step between two counts', () => {
    expect(stepCountCellsOf(countSheetOf(marks, []), { start: 3.1, end: 3.4 })).toEqual([]);
  });
});

describe('stepCardKeyOf', () => {
  const press = {
    key: ' ',
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    repeat: false,
    typing: false,
    onControl: false,
    onWidget: false,
  };

  it.each([
    [{ ...press }, 'toggle'],
    [{ ...press, onControl: true }, null],
    [{ ...press, typing: true }, null],
    [{ ...press, key: 'ArrowLeft' }, 'stepBack'],
    [{ ...press, key: 'ArrowLeft', shiftKey: true }, 'countBack'],
    [{ ...press, key: 'ArrowRight' }, 'stepForward'],
    [{ ...press, key: 'ArrowRight', shiftKey: true }, 'countForward'],
    [{ ...press, key: 'ArrowRight', ctrlKey: true }, null],
    [{ ...press, key: 'z' }, null],
    [{ ...press, repeat: true }, null],
    [{ ...press, key: 'ArrowLeft', onControl: true }, 'stepBack'],
    [{ ...press, key: 'ArrowLeft', onWidget: true }, null],
  ])('maps %o to %s', (pressed, key) => {
    expect(stepCardKeyOf(pressed)).toBe(key);
  });
});
