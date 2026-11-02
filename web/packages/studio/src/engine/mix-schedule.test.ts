import { describe, expect, it } from 'vitest';
import type { MusicSegment } from '../models/music-timeline';
import type { MixRun } from './mix-schedule';
import { mixPiecesOf, playRangeOf, positionInRuns, stretchSlicesOf } from './mix-schedule';

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

describe('stretchSlicesOf', () => {
  it('lays the cut songs end to end in samples, without a gap', () => {
    expect(stretchSlicesOf(mix, 30, 10)).toEqual([
      { mediaItemId: 1, sourceSample: 100, samples: 200 },
      { mediaItemId: 2, sourceSample: 50, samples: 100 },
    ]);
  });

  it('fills a song that cannot play with silence of its length', () => {
    const muted = [segment({ audible: false }), mix[1] ?? segment({})];

    expect(stretchSlicesOf(muted, 30, 10)).toEqual([
      { mediaItemId: null, sourceSample: 0, samples: 200 },
      { mediaItemId: 2, sourceSample: 50, samples: 100 },
    ]);
  });

  it('never lets a rounded border overlap the song before it', () => {
    const tight = [
      segment({ timelineEnd: 1.06, sourceEnd: 11.06 }),
      segment({
        mediaItemId: 2,
        sourceStart: 0,
        sourceEnd: 1,
        timelineStart: 1.04,
        timelineEnd: 2,
      }),
    ];

    expect(stretchSlicesOf(tight, 2, 10)).toEqual([
      { mediaItemId: 1, sourceSample: 100, samples: 11 },
      { mediaItemId: 2, sourceSample: 1, samples: 9 },
    ]);
  });
});
