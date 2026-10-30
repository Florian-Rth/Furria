import { describe, expect, it } from 'vitest';
import {
  centredOn,
  firstWindowOf,
  keptInViewOf,
  pannedOf,
  placedWindowOf,
  playheadShareOf,
  resizedOf,
  trackScaleOf,
  zoomedOf,
} from './focus-window';

describe('placedWindowOf', () => {
  it.each([
    { start: 10, width: 16, length: 178, expected: { start: 10, width: 16 } },
    { start: -20, width: 16, length: 178, expected: { start: -8, width: 16 } },
    { start: 200, width: 16, length: 178, expected: { start: 170, width: 16 } },
    { start: 0, width: 1, length: 178, expected: { start: 0, width: 3 } },
    { start: 0, width: 400, length: 178, expected: { start: 0, width: 178 } },
    { start: 0, width: 16, length: 0, expected: { start: 0, width: 3 } },
  ])('places $start/$width in $length', ({ start, width, length, expected }) => {
    expect(placedWindowOf(start, width, length)).toEqual(expected);
  });
});

describe('firstWindowOf', () => {
  it('opens on the first sixteen seconds', () => {
    expect(firstWindowOf(178)).toEqual({ start: 0, width: 16 });
  });
});

describe('centredOn and keptInViewOf', () => {
  it('centres the playhead', () => {
    expect(centredOn({ start: 0, width: 16 }, 60, 178)).toEqual({ start: 52, width: 16 });
  });

  it.each([
    { seconds: 8, expected: { start: 0, width: 16 } },
    { seconds: 40, expected: { start: 32, width: 16 } },
  ])('keeps $seconds in view', ({ seconds, expected }) => {
    expect(keptInViewOf({ start: 0, width: 16 }, seconds, 178)).toEqual(expected);
  });
});

describe('zoomedOf', () => {
  it.each([
    { factor: 0.5, anchor: 20, expected: { start: 15, width: 8 } },
    { factor: 2, anchor: 10, expected: { start: 10, width: 32 } },
    { factor: 0.01, anchor: 18, expected: { start: 16.5, width: 3 } },
  ])('zooms by $factor around $anchor', ({ factor, anchor, expected }) => {
    expect(zoomedOf({ start: 10, width: 16 }, factor, anchor, 178)).toEqual(expected);
  });
});

describe('pannedOf and resizedOf', () => {
  it('pans by seconds', () => {
    expect(pannedOf({ start: 10, width: 16 }, 5, 178)).toEqual({ start: 15, width: 16 });
  });

  it.each([
    { edge: 'start' as const, seconds: 4, expected: { start: 4, width: 22 } },
    { edge: 'start' as const, seconds: 25, expected: { start: 23, width: 3 } },
    { edge: 'end' as const, seconds: 40, expected: { start: 10, width: 30 } },
    { edge: 'end' as const, seconds: 300, expected: { start: 10, width: 168 } },
  ])('resizes the $edge edge to $seconds', ({ edge, seconds, expected }) => {
    expect(resizedOf({ start: 10, width: 16 }, edge, seconds, 178)).toEqual(expected);
  });
});

describe('trackScaleOf', () => {
  it.each([
    { width: 16, length: 160, expected: 10 },
    { width: 16, length: 0, expected: 1 },
  ])('scales $length over $width', ({ width, length, expected }) => {
    expect(trackScaleOf({ start: 0, width }, length)).toBe(expected);
  });
});

describe('playheadShareOf', () => {
  it.each([
    { seconds: 14, playing: true, expected: 0.5 },
    { seconds: 14, playing: false, expected: 0.25 },
    { seconds: 9, playing: false, expected: null },
    { seconds: 27, playing: false, expected: null },
  ])('at $seconds while playing $playing', ({ seconds, playing, expected }) => {
    expect(playheadShareOf({ start: 10, width: 16 }, seconds, playing)).toBe(expected);
  });
});
