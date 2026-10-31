import { describe, expect, it } from 'vitest';
import { keyedSpotsAt, keyedTracksOf, keyShiftedTracksOf, keyTimesOf } from './desk-keyframes';

const keyAt = (seconds: number) => ({
  seconds,
  position: { rightMetres: 0, backMetres: 0 },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
});

const paths = [
  { spotId: 1, keyframes: [keyAt(0), keyAt(4), keyAt(8)] },
  { spotId: 2, keyframes: [keyAt(0), keyAt(4.02), keyAt(5)] },
  { spotId: 3, keyframes: [keyAt(2)] },
];

const timesOf = (tracks: ReturnType<typeof keyShiftedTracksOf>) =>
  Object.fromEntries(
    Object.entries(tracks).map(([spotId, keyframes]) => [
      spotId,
      keyframes.map((keyframe) => keyframe.seconds),
    ]),
  );

describe('keyTimesOf', () => {
  it('lists each moment once, merging near twins', () => {
    expect(keyTimesOf(paths)).toEqual([0, 2, 4, 5, 8]);
  });
});

describe('keyedSpotsAt', () => {
  it.each([
    [4, 2],
    [2, 1],
    [3, 0],
  ])('counts the spots keyed at %ds', (seconds, expected) => {
    expect(keyedSpotsAt(paths, seconds)).toBe(expected);
  });
});

describe('keyedTracksOf', () => {
  it('takes the tracks keyed at that moment as they are', () => {
    expect(timesOf(keyedTracksOf(paths, 4))).toEqual({ 1: [0, 4, 8], 2: [0, 4.02, 5] });
  });
});

describe('keyShiftedTracksOf', () => {
  it('moves every spot keyed at that moment', () => {
    expect(timesOf(keyShiftedTracksOf(paths, 4, 3))).toEqual({ 1: [0, 3, 8], 2: [0, 3, 5] });
  });

  it('stops each spot short of its neighbouring keys', () => {
    expect(timesOf(keyShiftedTracksOf(paths, 4, 6))).toEqual({ 1: [0, 6, 8], 2: [0, 4.95, 5] });
  });

  it('never goes before the start', () => {
    expect(timesOf(keyShiftedTracksOf(paths, 2, -3))).toEqual({ 3: [0] });
  });

  it('leaves tracks that would not change out', () => {
    expect(keyShiftedTracksOf(paths, 3, 1)).toEqual({});
  });
});
