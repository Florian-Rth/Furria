import { describe, expect, it } from 'vitest';
import type { TimedKeyframe } from '../models/choreography-motion';
import type { MusicSegment } from '../models/music-timeline';
import {
  countSharesOf,
  cutSharesOf,
  keyframeMarksOf,
  loopSharesOf,
  rulerLabelOf,
  rulerTicksOf,
  secondsOfShare,
  spanSharesOf,
  tickStepOf,
  windowOf,
} from './timeline-geometry';

const keyframe = (seconds: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres: 0, backMetres: 0 },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const segment = (timelineStart: number, timelineEnd: number): MusicSegment => ({
  mediaItemId: 1,
  audioUrl: '',
  peaksUrl: '',
  audible: true,
  sourceStart: 0,
  sourceEnd: timelineEnd - timelineStart,
  timelineStart,
  timelineEnd,
  beats: [],
});

describe('tickStepOf', () => {
  it.each([
    [186, 30],
    [60, 5],
    [12, 1],
    [2000, 60],
  ])('spaces the ruler for %i visible seconds at %i seconds', (visible, expected) => {
    expect(tickStepOf(visible)).toBe(expected);
  });
});

describe('rulerTicksOf', () => {
  it('marks the whole music at the spacing of the window', () => {
    expect(rulerTicksOf(100, { start: 0, end: 1 }).map((tick) => tick.seconds)).toEqual([
      0, 10, 20, 30, 40, 50, 60, 70, 80, 90,
    ]);
    expect(rulerTicksOf(100, { start: 0, end: 0.2 }).filter((tick) => tick.seconds < 6)).toEqual([
      { seconds: 0, share: 0, label: '0:00' },
      { seconds: 2, share: 0.02, label: '0:02' },
      { seconds: 4, share: 0.04, label: '0:04' },
    ]);
  });

  it('has no ticks without music', () => {
    expect(rulerTicksOf(0, { start: 0, end: 1 })).toEqual([]);
  });
});

describe('rulerLabelOf', () => {
  it.each([
    [0, '0:00'],
    [59.9, '0:59'],
    [125, '2:05'],
    [-3, '0:00'],
  ])('labels %f seconds as %s', (seconds, expected) => {
    expect(rulerLabelOf(seconds)).toBe(expected);
  });
});

describe('windowOf', () => {
  it('frames the focus with a small margin inside the music', () => {
    const window = windowOf({ start: 50, end: 100 }, 200);

    expect(window.start).toBeCloseTo(0.235);
    expect(window.end).toBeCloseTo(0.515);
  });

  it.each([
    [null, 200],
    [{ start: 0, end: 10 }, 0],
  ])('shows the whole music for %o', (focus, length) => {
    expect(windowOf(focus, length)).toEqual({ start: 0, end: 1 });
  });

  it('stays inside the music at the edges', () => {
    expect(windowOf({ start: 0, end: 200 }, 200)).toEqual({ start: 0, end: 1 });
  });
});

describe('secondsOfShare', () => {
  it.each([
    [0.25, 20],
    [-1, 0],
    [2, 80],
  ])('turns share %f of 80 seconds into %f seconds', (share, expected) => {
    expect(secondsOfShare(share, 80)).toBe(expected);
  });
});

describe('spanSharesOf', () => {
  it('places timed spans as shares of the music and drops untimed ones', () => {
    const spans = [
      { key: 1, range: { start: 2, end: 10 }, name: 'A' },
      { key: 2, range: null, name: 'B' },
      { key: 3, range: { start: 12, end: 24 }, name: 'C' },
    ];

    expect(spanSharesOf(spans, 20)).toEqual([
      { key: 1, range: { start: 2, end: 10 }, name: 'A', from: 0.1, to: 0.5 },
      { key: 3, range: { start: 12, end: 24 }, name: 'C', from: 0.6, to: 1 },
    ]);
  });

  it('places nothing without music', () => {
    expect(spanSharesOf([{ key: 1, range: { start: 0, end: 1 } }], 0)).toEqual([]);
  });
});

describe('countSharesOf', () => {
  it('draws a line on every first count', () => {
    const marks = [
      { seconds: 0, count: 1 },
      { seconds: 1, count: 2 },
      { seconds: 8, count: 1 },
    ];

    expect(countSharesOf(marks, 16)).toEqual([0, 0.5]);
  });
});

describe('cutSharesOf', () => {
  it('marks where each following song starts', () => {
    expect(cutSharesOf([segment(0, 10), segment(10, 30), segment(30, 40)], 40)).toEqual([
      0.25, 0.75,
    ]);
  });
});

describe('loopSharesOf', () => {
  it.each([
    [{ start: 5, end: 15 }, 20, { from: 0.25, to: 0.75 }],
    [null, 20, null],
    [{ start: 5, end: 5 }, 20, null],
    [{ start: 5, end: 15 }, 0, null],
  ])('frames loop %o of %i seconds as %o', (range, length, expected) => {
    expect(loopSharesOf(range, length)).toEqual(expected);
  });
});

describe('keyframeMarksOf', () => {
  it('shows one mark per moment, lit when a selected spot changes there', () => {
    const paths = [
      { spotId: 1, keyframes: [keyframe(2), keyframe(10)] },
      { spotId: 2, keyframes: [keyframe(2.001), keyframe(6), keyframe(30)] },
    ];

    expect(keyframeMarksOf(paths, new Set([2]), 20)).toEqual([
      { key: '2', share: 0.1, selected: true },
      { key: '6', share: 0.3, selected: true },
      { key: '10', share: 0.5, selected: false },
    ]);
  });
});
