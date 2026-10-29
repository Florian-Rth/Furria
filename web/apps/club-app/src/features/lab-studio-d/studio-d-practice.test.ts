import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep, StudioVideo } from '@/features/acts/schemas';
import {
  beatIndexAt,
  clockOf,
  controlsShownOf,
  framingOf,
  heroVideoOf,
  loopedStepIdOf,
  loopShareOf,
  practiceStepOf,
  ratePercentOf,
  releasesLoop,
  stepGroupsOf,
  stepMarksOf,
  surfaceTapOf,
} from './studio-d-practice';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const steps: StudioStep[] = [step(1, 0, 10), step(2, 10, 20), step(3, 20, 30), step(4, 30, 40)];

const parts: StudioPart[] = [
  { partId: 1, name: 'Marsch', stepIds: [1, 2], mainVideoId: 7, adrift: false },
  { partId: 2, name: 'Finale', stepIds: [3], mainVideoId: null, adrift: false },
];

const video: StudioVideo = {
  videoId: 7,
  mediaItemId: 70,
  name: 'Probe',
  state: 'ready',
  durationSeconds: 12,
  startSeconds: 3,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', poster: '/p' },
};

describe('practiceStepOf', () => {
  it.each([
    [15, 2],
    [-1, 1],
    [45, 4],
  ])('at %s s practises step %s', (seconds, stepId) => {
    expect(practiceStepOf(steps, seconds)?.stepId).toBe(stepId);
  });

  it('has nothing to practise without steps', () => {
    expect(practiceStepOf([], 3)).toBeNull();
  });
});

describe('heroVideoOf', () => {
  it.each([
    [5, 7],
    [0, 7],
    [16, null],
    [25, null],
  ])('at %s s shows video %s', (seconds, videoId) => {
    expect(heroVideoOf([video], parts, steps, seconds)?.videoId ?? null).toBe(videoId);
  });

  it('never leads into an outdated video', () => {
    expect(heroVideoOf([{ ...video, outdated: true }], parts, steps, 0)).toBeNull();
  });
});

describe('framingOf', () => {
  it.each([
    [false, false, { full: 'stage', inset: null }],
    [false, true, { full: 'stage', inset: null }],
    [true, false, { full: 'video', inset: 'stage' }],
    [true, true, { full: 'stage', inset: 'video' }],
  ])('with video %s and stage first %s frames %o', (hasVideo, stageFirst, framing) => {
    expect(framingOf(hasVideo, stageFirst)).toEqual(framing);
  });
});

describe('stepMarksOf', () => {
  it('marks every step border and flags where a part opens', () => {
    expect(stepMarksOf(steps, parts, 40)).toEqual([
      { stepId: 2, at: 0.25, opensPart: false },
      { stepId: 3, at: 0.5, opensPart: true },
      { stepId: 4, at: 0.75, opensPart: true },
    ]);
  });

  it('places marks at the start of an empty mix', () => {
    expect(stepMarksOf(steps.slice(0, 2), parts, 0)).toEqual([
      { stepId: 2, at: 0, opensPart: false },
    ]);
  });
});

describe('loopShareOf', () => {
  it.each([
    [null, null],
    [
      { start: 10, end: 20 },
      { start: 0.25, end: 0.5 },
    ],
    [
      { start: -5, end: 50 },
      { start: 0, end: 1 },
    ],
  ])('shares loop %o as %o', (loop, share) => {
    expect(loopShareOf(loop, 40)).toEqual(share);
  });
});

describe('loopedStepIdOf', () => {
  it.each([
    [null, null],
    [{ start: 10, end: 20 }, 2],
    [{ start: 0, end: 20 }, null],
  ])('loop %o repeats step %s', (loop, stepId) => {
    expect(loopedStepIdOf(loop, steps)).toBe(stepId);
  });
});

describe('releasesLoop', () => {
  it.each([
    [null, 5, false],
    [{ start: 10, end: 20 }, 15, false],
    [{ start: 10, end: 20 }, 20, true],
    [{ start: 10, end: 20 }, 3, true],
  ])('loop %o seeking to %s releases %s', (loop, seconds, released) => {
    expect(releasesLoop(loop, seconds)).toBe(released);
  });
});

describe('controlsShownOf', () => {
  it.each([
    [false, false, false, true],
    [true, false, false, false],
    [true, true, false, true],
    [true, false, true, true],
  ])('playing %s awake %s holding %s shows %s', (playing, awake, holding, shown) => {
    expect(controlsShownOf({ playing, awake, holding })).toBe(shown);
  });
});

describe('surfaceTapOf', () => {
  it.each([
    [true, false, 'none'],
    [false, false, 'none'],
    [true, true, 'sleep'],
    [false, true, 'wake'],
  ])('shown %s playing %s taps to %s', (shown, playing, tap) => {
    expect(surfaceTapOf(shown, playing)).toBe(tap);
  });
});

describe('beatIndexAt', () => {
  const marks = [
    { seconds: 1, count: 1 },
    { seconds: 1.5, count: 2 },
    { seconds: 2, count: 3 },
  ];

  it.each([
    [0.5, -1],
    [1, 0],
    [1.7, 1],
    [9, 2],
  ])('at %s s is on beat %s', (seconds, index) => {
    expect(beatIndexAt(marks, seconds)).toBe(index);
  });
});

describe('stepGroupsOf', () => {
  it('groups consecutive steps by their part', () => {
    const groups = stepGroupsOf(steps, parts);

    expect(groups.map((group) => [group.key, group.steps.map((entry) => entry.stepId)])).toEqual([
      ['part-1', [1, 2]],
      ['part-2', [3]],
      ['loose', [4]],
    ]);
  });
});

describe('clockOf', () => {
  it.each([
    [0, '0:00'],
    [65.9, '1:05'],
    [-3, '0:00'],
  ])('formats %s s as %s', (seconds, clock) => {
    expect(clockOf(seconds)).toBe(clock);
  });
});

describe('ratePercentOf', () => {
  it.each([
    [1, '100 %'],
    [0.75, '75 %'],
  ])('formats %s as %s', (rate, text) => {
    expect(ratePercentOf(rate)).toBe(text);
  });
});
