import { describe, expect, it } from 'vitest';
import type { MixRun } from './mix-schedule';
import { mixPiecesOf, pitchCorrectionOf, playRangeOf, positionInRuns } from './mix-schedule';
import type { MusicSegment } from './music-timeline';

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 10,
  sourceEnd: 30,
  timelineStart: 0,
  timelineEnd: 20,
  beats: [],
  ...patch,
});

const mix = [
  segment({}),
  segment({ mediaItemId: 2, sourceStart: 5, sourceEnd: 15, timelineStart: 20, timelineEnd: 30 }),
];

describe('mixPiecesOf', () => {
  it('cuts a stretch of the timeline into the source pieces that play it, without a gap', () => {
    expect(mixPiecesOf(mix, 15, 25)).toEqual([
      { mediaItemId: 1, sourceOffset: 25, duration: 5, timelineStart: 15 },
      { mediaItemId: 2, sourceOffset: 5, duration: 5, timelineStart: 20 },
    ]);
  });

  it('plays nothing of a song the stretch does not reach', () => {
    expect(mixPiecesOf(mix, 22, 24).map((piece) => piece.mediaItemId)).toEqual([2]);
  });
});

describe('positionInRuns', () => {
  const runs: MixRun[] = [
    { contextStart: 100, from: 8, to: 16, rate: 0.5 },
    { contextStart: 116, from: 8, to: 16, rate: 0.5 },
  ];

  it.each([
    [99, 8],
    [104, 10],
    [116, 8],
    [131, 15.5],
    [140, 16],
  ])('is at %s on the audio clock at %s on the music', (clock, expected) => {
    expect(positionInRuns(runs, clock)).toBe(expected);
  });

  it('waits at the start of the next pass while its count-in runs', () => {
    const counted: MixRun[] = [
      { contextStart: 100, from: 8, to: 16, rate: 0.5 },
      { contextStart: 118, from: 8, to: 16, rate: 0.5 },
    ];

    expect(positionInRuns(counted, 117)).toBe(8);
  });

  it('knows no position before anything is scheduled', () => {
    expect(positionInRuns([], 10)).toBeNull();
  });
});

describe('playRangeOf', () => {
  it.each([
    [5, null, { start: 5, end: 30 }],
    [10, { start: 8, end: 16 }, { start: 10, end: 16 }],
    [20, { start: 8, end: 16 }, { start: 8, end: 16 }],
  ])('plays from %s with loop %o through %o', (from, loop, expected) => {
    expect(playRangeOf(from, loop, 30)).toEqual(expected);
  });
});

describe('pitchCorrectionOf', () => {
  it.each([
    [1, 0],
    [0.5, 12],
    [Math.SQRT1_2, 6],
  ])('lifts music slowed to %s by %s semitones', (rate, semitones) => {
    expect(pitchCorrectionOf(rate)).toBeCloseTo(semitones, 6);
  });
});
