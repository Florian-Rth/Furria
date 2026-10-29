import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import {
  dragOf,
  fillOf,
  isLooped,
  loopKindOf,
  loopRangeOf,
  partVideoOf,
  segmentGroupsOf,
  swipedRateOf,
  tapZoneOf,
} from './studio-e-controls';

const step = (
  stepId: number,
  startSeconds: number | null,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const part = (partId: number, stepIds: number[], mainVideoId: number | null): StudioPart => ({
  partId,
  name: `Teil ${partId}`,
  stepIds,
  mainVideoId,
  adrift: false,
});

const video = (videoId: number, startSeconds: number, durationSeconds: number): StudioVideo => ({
  videoId,
  mediaItemId: videoId,
  name: null,
  state: 'ready',
  durationSeconds,
  startSeconds,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
});

const steps = [step(1, 0, 10), step(2, 10, 20), step(3, 20, 30), step(4, 30, 40)];
const parts = [part(1, [1, 2], 7), part(2, [3, 4], null)];

describe('loopKindOf', () => {
  it.each([
    [null, 1, 'off'],
    [{ start: 0, end: 10 }, 1, 'step'],
    [{ start: 0, end: 20 }, 2, 'part'],
    [{ start: 20, end: 30 }, 2, 'step'],
  ] as const)('loop %o around step %s is %s', (loop, stepId, kind) => {
    const shown = steps.find((candidate) => candidate.stepId === stepId) ?? null;
    expect(loopKindOf(loop, shown, parts, steps)).toBe(kind);
  });
});

describe('loopRangeOf', () => {
  it.each([
    ['off', 2, null],
    ['step', 2, { start: 10, end: 20 }],
    ['part', 2, { start: 0, end: 20 }],
    ['part', 4, { start: 20, end: 40 }],
  ] as const)('%s around step %s loops %o', (kind, stepId, range) => {
    const shown = steps.find((candidate) => candidate.stepId === stepId) ?? null;
    expect(loopRangeOf(kind, shown, parts, steps)).toEqual(range);
  });

  it('loops a step outside every part on its own', () => {
    const lone = step(5, 40, 50);
    expect(loopRangeOf('part', lone, parts, [...steps, lone])).toEqual({ start: 40, end: 50 });
  });
});

describe('partVideoOf', () => {
  const videos = [video(7, 2, 18)];

  it.each([
    [0, 7],
    [5, 7],
    [25, null],
  ])('at %s s the hero video is %s', (seconds, videoId) => {
    expect(partVideoOf(videos, parts, steps, seconds)?.videoId ?? null).toBe(videoId);
  });

  it('finds a video that only covers part of a part without a main video', () => {
    expect(partVideoOf([video(8, 32, 5)], parts, steps, 21)?.videoId).toBe(8);
  });
});

describe('swipedRateOf', () => {
  it.each([
    [1, 0, 1],
    [1, -0.2, 0.8],
    [0.8, 0.5, 1],
    [0.6, -0.5, 0.5],
    [0.7, 0.07, 0.75],
  ])('%s swiped by %s becomes %s', (rate, rise, next) => {
    expect(swipedRateOf(rate, rise)).toBe(next);
  });
});

describe('tapZoneOf', () => {
  it.each([
    [0.1, 'back'],
    [0.5, 'middle'],
    [0.9, 'forward'],
  ] as const)('a tap at %s is %s', (share, zone) => {
    expect(tapZoneOf(share)).toBe(zone);
  });
});

describe('dragOf', () => {
  it.each([
    [3, 4, 'none'],
    [2, -40, 'vertical'],
    [40, 10, 'horizontal'],
  ] as const)('moving %s/%s is %s', (dx, dy, drag) => {
    expect(dragOf(dx, dy)).toBe(drag);
  });
});

describe('segmentGroupsOf', () => {
  it('groups the timed steps by part and weighs them by length', () => {
    const lone = step(5, 40, 46);
    expect(segmentGroupsOf([...steps, lone, step(6, null, null)], parts)).toEqual([
      {
        key: 'part-1',
        name: 'Teil 1',
        grow: 20,
        steps: [
          { stepId: 1, grow: 10 },
          { stepId: 2, grow: 10 },
        ],
      },
      {
        key: 'part-2',
        name: 'Teil 2',
        grow: 20,
        steps: [
          { stepId: 3, grow: 10 },
          { stepId: 4, grow: 10 },
        ],
      },
      { key: 'step-5', name: null, grow: 6, steps: [{ stepId: 5, grow: 6 }] },
    ]);
  });
});

describe('fillOf', () => {
  it.each([
    [5, 0],
    [12.5, 0.25],
    [25, 1],
  ])('at %s s step 2 is filled to %s', (seconds, fill) => {
    expect(fillOf(step(2, 10, 20), seconds)).toBe(fill);
  });
});

describe('isLooped', () => {
  it.each([
    [{ start: 0, end: 20 }, true],
    [{ start: 10, end: 20 }, true],
    [{ start: 0, end: 10 }, false],
    [null, false],
  ])('step 2 inside %o is %s', (loop, looped) => {
    expect(isLooped(step(2, 10, 20), loop)).toBe(looped);
  });
});
