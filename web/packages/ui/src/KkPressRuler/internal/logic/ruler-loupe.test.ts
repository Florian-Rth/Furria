import { describe, expect, it } from 'vitest';
import {
  loupeLeftOf,
  loupeSideOf,
  loupeWindowOf,
  marksInWindowOf,
  shareInWindowOf,
} from './ruler-loupe';

describe('loupeLeftOf', () => {
  it.each([
    { finger: 200, expected: 82 },
    { finger: 10, expected: 0 },
    { finger: 390, expected: 164 },
  ])('centres the loupe on finger $finger within the ruler', ({ finger, expected }) => {
    expect(loupeLeftOf(finger, 400, 236)).toBe(expected);
  });
});

describe('loupeWindowOf', () => {
  it.each([
    { share: 0.5, expected: { from: 0.4, to: 0.6 } },
    { share: 0.02, expected: { from: 0, to: 0.2 } },
    { share: 0.98, expected: { from: 0.8, to: 1 } },
  ])('keeps the window around $share inside the season', ({ share, expected }) => {
    const window = loupeWindowOf(share, 0.1);

    expect(window.from).toBeCloseTo(expected.from);
    expect(window.to).toBeCloseTo(expected.to);
  });
});

describe('marksInWindowOf', () => {
  it('keeps marks inside the window and rescales them to it', () => {
    const marks = [0.1, 0.45, 0.55, 0.9].map((share) => ({
      id: String(share),
      state: 'aligned' as const,
      share,
      day: '',
      dayLabel: '',
      title: '',
    }));

    expect(marksInWindowOf(marks, { from: 0.4, to: 0.6 }).map((m) => m.share)).toEqual([
      expect.closeTo(0.25),
      expect.closeTo(0.75),
    ]);
  });
});

describe('shareInWindowOf', () => {
  it.each([
    { share: 0.5, expected: 0.5 },
    { share: 0.7, expected: null },
  ])('maps $share into the window', ({ share, expected }) => {
    expect(shareInWindowOf(share, { from: 0.4, to: 0.6 })).toBe(expected);
  });
});

describe('loupeSideOf', () => {
  it.each([
    { laneTop: 400, expected: 'above' },
    { laneTop: 200, expected: 'below' },
  ])('opens $expected a lane at $laneTop under an 80px bar', ({ laneTop, expected }) => {
    expect(loupeSideOf(laneTop, 80, 168)).toBe(expected);
  });
});
