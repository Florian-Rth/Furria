import {
  hasFormationOf,
  setupProgressOf,
  setupResumeOf,
  stepsInRangeOf,
  timedStepsOf,
} from '@furria/studio/setup-progress';
import { describe, expect, it } from 'vitest';

const keyframe = (seconds: number, right: number) => ({
  seconds,
  position: { rightMetres: right, backMetres: 2 },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
});

const steps = [
  { stepId: 1, name: 'Einmarsch', start: 0, end: 4 },
  { stepId: 2, name: '', start: 4, end: 8 },
  { stepId: 3, name: '', start: 8, end: 12 },
];

describe('stepsInRangeOf', () => {
  it('keeps steps overlapping the range, not those touching its edge', () => {
    expect(stepsInRangeOf(steps, { start: 4, end: 9 }).map((step) => step.stepId)).toEqual([2, 3]);
  });
});

describe('hasFormationOf', () => {
  it.each([
    [[keyframe(4, 0)], 2, true],
    [[keyframe(6, 0)], 2, true],
    [[keyframe(8, 0)], 2, false],
    [[keyframe(0, 0)], 2, false],
  ])('%o for step %i → %s', (keyframes, stepId, formed) => {
    const step = steps.find((candidate) => candidate.stepId === stepId);
    if (step === undefined) {
      throw new Error('no step');
    }

    expect(hasFormationOf([{ spotId: 1, keyframes }], step)).toBe(formed);
  });
});

describe('setupProgressOf', () => {
  it('counts unnamed steps', () => {
    expect(setupProgressOf(steps)).toEqual({ total: 3, unnamed: 2 });
  });
});

describe('setupResumeOf', () => {
  const progress = { total: 8, unnamed: 0 };

  it.each([
    [progress, false, 'nothing', 0],
    [{ ...progress, unnamed: 2 }, true, 'names', 2],
    [progress, true, 'nothing', 0],
    [{ ...progress, total: 0 }, true, 'nothing', 0],
  ] as const)('%o with video %s → open %s', (shown, hasVideo, open, count) => {
    expect(setupResumeOf(shown, hasVideo)).toEqual({ open, count, total: shown.total });
  });
});

describe('timedStepsOf', () => {
  it.each([
    [
      { stepId: 1, name: 'A', startSeconds: 2, endSeconds: 4 },
      [{ stepId: 1, name: 'A', start: 2, end: 4 }],
    ],
    [{ stepId: 2, name: 'B', startSeconds: null, endSeconds: 4 }, []],
    [{ stepId: 3, name: 'C', startSeconds: 2, endSeconds: null }, []],
  ])('%o → %o', (step, timed) => {
    expect(timedStepsOf([step])).toEqual(timed);
  });
});
