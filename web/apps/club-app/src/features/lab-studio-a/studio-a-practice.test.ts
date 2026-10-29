import { describe, expect, it } from 'vitest';
import type { CountMark } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import {
  beatIndexAt,
  beatOf,
  framedVideoOf,
  loopedPartIdOf,
  loopedStepIdOf,
  loopKindOf,
  practiceStepOf,
  stepLengthOf,
} from './studio-a-practice';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: 'Schritt',
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const part = (
  partId: number,
  stepIds: number[],
  mainVideoId: number | null = null,
): StudioPart => ({
  partId,
  name: 'Teil',
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

const marksEvery = (from: number, beat: number, total: number): CountMark[] =>
  Array.from({ length: total }, (_, index) => ({
    seconds: from + index * beat,
    count: (index % 8) + 1,
  }));

const steps = [step(1, 2, 10), step(2, 10, 20), step(3, 24, 30)];
const parts = [part(7, [1, 2], 40), part(8, [3])];

describe('practiceStepOf', () => {
  it.each([
    [0, 1],
    [5, 1],
    [10, 2],
    [21, 3],
    [40, 3],
  ])('practises at %s seconds step %s', (seconds, stepId) => {
    expect(practiceStepOf(steps, seconds)?.stepId).toBe(stepId);
  });

  it('has nothing to practise without steps', () => {
    expect(practiceStepOf([], 3)).toBeNull();
  });
});

describe('loopKindOf', () => {
  it.each([
    [null, null],
    [{ start: 10, end: 20 }, 'step'],
    [{ start: 2, end: 20 }, 'part'],
    [{ start: 3, end: 4 }, 'free'],
  ] as const)('reads loop %o as %s', (loop, kind) => {
    expect(loopKindOf(loop, steps[1] ?? null, parts[0] ?? null, steps)).toBe(kind);
  });
});

describe('looped ids', () => {
  it('finds the looped part and step', () => {
    expect(loopedPartIdOf({ start: 24, end: 30 }, parts, steps)).toBe(8);
    expect(loopedStepIdOf({ start: 24, end: 30 }, steps)).toBe(3);
    expect(loopedStepIdOf({ start: 2, end: 20 }, steps)).toBeNull();
    expect(loopedPartIdOf(null, parts, steps)).toBeNull();
  });
});

describe('beatIndexAt', () => {
  const marks = marksEvery(1, 0.5, 10);

  it.each([
    [0, -1],
    [1, 0],
    [1.49, 0],
    [3.2, 4],
    [100, 9],
  ])('at %s seconds is on beat %s', (seconds, index) => {
    expect(beatIndexAt(marks, seconds)).toBe(index);
  });
});

describe('beatOf', () => {
  const marks = marksEvery(2, 0.5, 32);

  it('counts the eight within the step', () => {
    expect(beatOf(marks, 11, step(1, 2, 10))).toEqual({ count: 4, eight: 2, eights: 2 });
  });

  it('keeps the count but not the eight outside the step', () => {
    expect(beatOf(marks, 20, step(1, 2, 10))).toEqual({ count: 5, eight: null, eights: null });
  });

  it('has no beat before the first count', () => {
    expect(beatOf(marks, -1, null)).toBeNull();
  });
});

describe('stepLengthOf', () => {
  const marks = marksEvery(2, 0.5, 40);

  it.each([
    [step(1, 2, 10), { kind: 'eights', eights: 2 }],
    [step(2, 2, 4), { kind: 'counts', counts: 4 }],
    [step(3, 30, 36), { kind: 'seconds', seconds: 6 }],
  ])('measures %o as %o', (measured, length) => {
    expect(stepLengthOf(marks, measured)).toEqual(length);
  });
});

describe('framedVideoOf', () => {
  const videos = [video(40, 4, 14)];

  it.each([
    [6, 40],
    [2, 40],
    [25, null],
  ])('frames at %s seconds video %s', (seconds, videoId) => {
    expect(framedVideoOf(videos, parts, steps, seconds)?.videoId ?? null).toBe(videoId);
  });
});
