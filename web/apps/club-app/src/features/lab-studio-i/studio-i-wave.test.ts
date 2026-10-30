import { describe, expect, it } from 'vitest';
import type { MusicSegment } from '@/features/act-player/music-timeline';
import { loopRangeOf, pageWindowOf, seamsIn, ticksIn, windowBarsOf } from './studio-i-wave';

const span = { stepId: 4, start: 10, end: 20 };
const marks = [8, 9, 10, 11, 19, 20].map((seconds, index) => ({ seconds, count: index + 1 }));

const segment = (
  mediaItemId: number,
  timelineStart: number,
  timelineEnd: number,
): MusicSegment => ({
  mediaItemId,
  audioUrl: '',
  peaksUrl: '',
  audible: true,
  sourceStart: 0,
  sourceEnd: timelineEnd - timelineStart,
  timelineStart,
  timelineEnd,
  firstBeatSeconds: 0,
  tempoBpm: 120,
});

describe('pageWindowOf', () => {
  it('shows the step with a little music around it', () => {
    expect(pageWindowOf(span, 100)).toEqual({ start: 8.6, end: 21.4 });
  });

  it('stays inside the music', () => {
    expect(pageWindowOf({ stepId: 1, start: 0, end: 4 }, 4.5)).toEqual({ start: 0, end: 4.5 });
  });
});

describe('ticksIn', () => {
  it('marks the counts that belong to the step', () => {
    const ticks = ticksIn(marks, { start: 9, end: 20 }, span);

    expect(ticks.map((tick) => [tick.count, tick.inside])).toEqual([
      [2, false],
      [3, true],
      [4, true],
      [5, true],
      [6, false],
    ]);
  });
});

describe('seamsIn', () => {
  it('finds the song cuts inside the window', () => {
    expect(seamsIn([segment(1, 0, 15), segment(2, 15, 40)], { start: 10, end: 20 })).toEqual([
      { key: '2', share: 0.5 },
    ]);
  });
});

describe('windowBarsOf', () => {
  it('reads the loudest peak per bar of the window, scaled to the loudest bar', () => {
    const peaks = new Map([[1, { peaksPerSecond: 1, peaks: [0.1, 0.2, 0.4, 0.8] }]]);

    expect(windowBarsOf([segment(1, 0, 4)], peaks, { start: 0, end: 4 }, 2)).toEqual([0.25, 1]);
  });
});

describe('loopRangeOf', () => {
  it('starts two counts before the step', () => {
    expect(loopRangeOf(span, marks)).toEqual({ start: 8, end: 20 });
  });

  it('starts a second early when the music has no counts', () => {
    expect(loopRangeOf(span, [])).toEqual({ start: 9, end: 20 });
  });
});
