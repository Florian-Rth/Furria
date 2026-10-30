import { describe, expect, it } from 'vitest';
import { countInAt, countInOf } from './count-in';
import type { MusicSegment } from './music-timeline';

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 0,
  sourceEnd: 20,
  timelineStart: 0,
  timelineEnd: 20,
  firstBeatSeconds: 1,
  tempoBpm: 120,
  ...patch,
});

const mix = [
  segment({}),
  segment({
    mediaItemId: 2,
    sourceStart: 10,
    sourceEnd: 30,
    timelineStart: 20,
    timelineEnd: 40,
    firstBeatSeconds: 10.25,
    tempoBpm: 60,
  }),
];

const countsOf = (start: number): number[] =>
  countInOf(mix, start, 1, 4)?.clicks.map((click) => click.count) ?? [];

describe('countInOf', () => {
  it.each([
    [5, [5, 6, 7, 8]],
    [3, [1, 2, 3, 4]],
    [7.995, [3, 4, 5, 6]],
    [0.5, [4, 5, 6, 7]],
    [22, [7, 8, 1, 2]],
  ])('counts the four beats that lead into a start at %s s', (start, counts) => {
    expect(countsOf(start)).toEqual(counts);
  });

  it('clicks once per beat and lets the music start on the beat after the last click', () => {
    expect(countInOf(mix, 5, 1, 4)).toEqual({
      leadSeconds: 2,
      clicks: [
        { offsetSeconds: 0, count: 5 },
        { offsetSeconds: 0.5, count: 6 },
        { offsetSeconds: 1, count: 7 },
        { offsetSeconds: 1.5, count: 8 },
      ],
    });
  });

  it('keeps a start a hair before its beat in time with the music', () => {
    expect(countInOf(mix, 7.995, 1, 4)?.leadSeconds).toBeCloseTo(1.995);
  });

  it('measures the beats of the song the start lies in', () => {
    expect(countInOf(mix, 22, 1, 4)?.leadSeconds).toBeCloseTo(3.75);
  });

  it('stretches the count-in with the tempo', () => {
    const slowed = countInOf(mix, 5, 0.75, 4);

    expect(slowed?.leadSeconds).toBeCloseTo(2 / 0.75);
    expect(slowed?.clicks.map((click) => click.offsetSeconds)).toEqual([
      0,
      0.5 / 0.75,
      1 / 0.75,
      1.5 / 0.75,
    ]);
  });

  it.each([
    ['a song without a tempo', [segment({ tempoBpm: null })], 5, 4],
    ['a song without a first beat', [segment({ firstBeatSeconds: null })], 5, 4],
    ['a start past the music', mix, 45, 4],
    ['no beats asked for', mix, 5, 0],
  ])('counts nothing in for %s', (_, segments, start, beats) => {
    expect(countInOf(segments, start, 1, beats)).toBeNull();
  });
});

describe('countInAt', () => {
  const countIn = {
    leadSeconds: 2,
    clicks: [
      { offsetSeconds: 0, count: 5 },
      { offsetSeconds: 0.5, count: 6 },
      { offsetSeconds: 1, count: 7 },
      { offsetSeconds: 1.5, count: 8 },
    ],
  };

  it.each([
    [-0.1, null],
    [0, 5],
    [0.7, 6],
    [1.995, 8],
    [2, null],
  ])('shows the count of the last click %s s into the count-in', (elapsed, count) => {
    expect(countInAt(countIn, elapsed)).toBe(count);
  });
});
