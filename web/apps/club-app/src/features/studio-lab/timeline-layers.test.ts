import type { MusicSegment } from '@furria/studio/music-timeline';
import { describe, expect, it } from 'vitest';
import {
  edgeTargetsOf,
  loudestPeakOf,
  snapCandidatesOf,
  ticksOf,
  waveBarsOf,
} from './timeline-layers';

const segment: MusicSegment = {
  mediaItemId: 1,
  audioUrl: '/n',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 2,
  sourceEnd: 6,
  timelineStart: 0,
  timelineEnd: 4,
  beats: [],
};

const peaks = new Map([[1, { peaksPerSecond: 1, peaks: [9, 9, 2, 4, 8, 1, 9, 9] }]]);

const marks = Array.from({ length: 16 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('loudestPeakOf', () => {
  it('finds the loudest peak of all files', () => {
    expect(loudestPeakOf(new Map([...peaks, [2, { peaksPerSecond: 1, peaks: [3, 12] }]]))).toBe(12);
  });
});

describe('waveBarsOf', () => {
  it('reads the cut source window and marks what has played', () => {
    const bars = waveBarsOf([segment], peaks, { pxPerSecond: 4, offsetPx: 0 }, 16, 2, 8);

    expect(bars.map((bar) => [bar.x, bar.level, bar.played])).toEqual([
      [0, 0.25, true],
      [4, 0.5, true],
      [8, 1, false],
      [12, 0.125, false],
    ]);
  });

  it('draws nothing without peaks', () => {
    expect(waveBarsOf([segment], peaks, { pxPerSecond: 4, offsetPx: 0 }, 16, 0, 0)).toEqual([]);
  });
});

describe('ticksOf', () => {
  it.each([
    [20, 6, 'beat'],
    [4, 2, 'one'],
    [1, 0, 'one'],
  ])('at %s px per second shows %s ticks', (pxPerSecond, count, firstKind) => {
    const ticks = ticksOf(marks, { pxPerSecond, offsetPx: 0 }, 50);

    expect(ticks).toHaveLength(count);
    if (count > 0) {
      expect(ticks.some((tick) => tick.kind === firstKind)).toBe(true);
    }
  });
});

describe('snapCandidatesOf', () => {
  it.each([
    [10, 16],
    [4, 2],
  ])('at %s px per second snaps to %s marks', (pxPerSecond, count) => {
    expect(snapCandidatesOf(marks, { pxPerSecond, offsetPx: 0 })).toHaveLength(count);
  });
});

describe('edgeTargetsOf', () => {
  it('puts borders in the band row and cuts below it', () => {
    const targets = edgeTargetsOf(
      [
        { kind: 'border', key: 'b', seconds: 2, endingStepId: 1, startingStepId: null },
        { kind: 'cut', key: 'c', seconds: 3, songId: 1 },
      ],
      { pxPerSecond: 10, offsetPx: 0 },
      100,
      'c',
    );

    expect(
      targets.map((target) => [
        target.id,
        target.x,
        target.y,
        target.height,
        target.priority,
        target.selected,
      ]),
    ).toEqual([
      ['b', 19, 0, 42, 1, false],
      ['c', 29, 42, 58, 0, true],
    ]);
  });
});
