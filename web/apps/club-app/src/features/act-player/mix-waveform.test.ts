import { describe, expect, it } from 'vitest';
import { waveformOf } from './mix-waveform';
import type { MusicSegment } from './music-timeline';

const segment = (patch: Partial<MusicSegment>): MusicSegment => ({
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 1,
  sourceEnd: 3,
  timelineStart: 0,
  timelineEnd: 2,
  firstBeatSeconds: null,
  tempoBpm: null,
  ...patch,
});

describe('waveformOf', () => {
  it('draws each bucket as its loudest peak of the cut music, scaled to the loudest bucket', () => {
    const peaks = new Map([
      [1, { peaksPerSecond: 2, peaks: [90, 90, 10, 20, 40, 5, 90] }],
      [2, { peaksPerSecond: 1, peaks: [8, 80] }],
    ]);
    const mix = [
      segment({}),
      segment({ mediaItemId: 2, sourceStart: 1, sourceEnd: 2, timelineStart: 2, timelineEnd: 3 }),
    ];

    expect(waveformOf(mix, peaks, 3)).toEqual([0.25, 0.5, 1]);
  });

  it('stays flat where the music has no peaks yet', () => {
    expect(waveformOf([segment({})], new Map(), 2)).toEqual([0, 0]);
  });
});
