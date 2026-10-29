import { describe, expect, it } from 'vitest';
import type { CountMark } from '@/features/act-player/music-timeline';
import { eightProgressAt, eightsIn } from './studio-b-beats';

const marksEvery = (beat: number, count: number, offset = 0): CountMark[] =>
  Array.from({ length: count }, (_, index) => ({
    seconds: offset + index * beat,
    count: (index % 8) + 1,
  }));

describe('eightsIn', () => {
  it.each([
    [{ start: 0, end: 8 }, 2],
    [{ start: 0, end: 6 }, 1.5],
    [{ start: 0.25, end: 4 }, 0.875],
    [{ start: 40, end: 50 }, 0],
  ])('%o holds %s eights', (range, expected) => {
    expect(eightsIn(marksEvery(0.5, 40), range)).toBe(expected);
  });
});

describe('eightProgressAt', () => {
  const marks = marksEvery(0.5, 40);
  const range = { start: 0, end: 8 };

  it.each([
    [0, { eight: 0, eights: 2, share: 0 }],
    [2, { eight: 0, eights: 2, share: 0.5 }],
    [4.25, { eight: 1, eights: 2, share: 0.0625 }],
    [8, { eight: 1, eights: 2, share: 1 }],
    [-1, { eight: 0, eights: 2, share: 0 }],
  ])('at %s s', (seconds, expected) => {
    expect(eightProgressAt(marks, range, seconds)).toEqual(expected);
  });

  it('counts from the first beat when the step starts before it', () => {
    expect(eightProgressAt(marksEvery(0.5, 16, 0.4), { start: 0, end: 8.4 }, 0.2)).toEqual({
      eight: 0,
      eights: 2,
      share: 0,
    });
  });

  it('has no eights without a beat grid', () => {
    expect(eightProgressAt([], range, 3)).toBeNull();
  });
});
