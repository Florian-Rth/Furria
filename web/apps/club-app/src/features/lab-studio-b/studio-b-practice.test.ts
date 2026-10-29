import { describe, expect, it } from 'vitest';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import {
  currentStepOf,
  loopScopeOf,
  neighbourOf,
  nextRateOf,
  pickedScopeOf,
  practiceLoopOf,
} from './studio-b-practice';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const steps = [step(1, 2, 8), step(2, 8, 15), step(3, 15, 30)];

const parts: StudioPart[] = [
  { partId: 10, name: 'A', stepIds: [1, 2], mainVideoId: null, adrift: false },
  { partId: 11, name: 'B', stepIds: [3], mainVideoId: null, adrift: false },
];

describe('currentStepOf', () => {
  it.each([
    [0, 1],
    [2, 1],
    [9, 2],
    [29.9, 3],
    [30, 3],
  ])('at %s s the step is %s', (seconds, expected) => {
    expect(currentStepOf(steps, seconds)?.stepId).toBe(expected);
  });

  it('is empty without steps', () => {
    expect(currentStepOf([], 4)).toBeNull();
  });
});

describe('loopScopeOf', () => {
  it.each([
    [null, 'off'],
    [{ start: 8, end: 15 }, 'step'],
    [{ start: 2, end: 15 }, 'part'],
    [{ start: 3, end: 12 }, 'other'],
  ] as const)('%o is %s', (loop, expected) => {
    expect(loopScopeOf(loop, steps[1] ?? null, parts, steps)).toBe(expected);
  });
});

describe('practiceLoopOf', () => {
  const second = step(2, 8, 15);

  it.each([
    ['step', { start: 8, end: 15 }],
    ['part', { start: 2, end: 15 }],
    ['off', null],
    ['other', null],
  ] as const)('%s loops %o', (scope, expected) => {
    expect(practiceLoopOf(scope, second, parts, steps)).toEqual(expected);
  });

  it('falls back to the step when it has no part', () => {
    expect(practiceLoopOf('part', step(4, 30, 40), parts, steps)).toEqual({ start: 30, end: 40 });
  });
});

describe('pickedScopeOf', () => {
  it.each([
    ['off', 'step'],
    ['other', 'step'],
    ['step', 'step'],
    ['part', 'part'],
  ] as const)('%s picks %s', (scope, expected) => {
    expect(pickedScopeOf(scope)).toBe(expected);
  });
});

describe('neighbourOf', () => {
  it.each([
    [1, 'next', 2],
    [2, 'previous', 1],
    [3, 'next', null],
    [1, 'previous', null],
    [9, 'next', null],
  ] as const)('%s %s is %s', (stepId, direction, expected) => {
    expect(neighbourOf(steps, stepId, direction)?.stepId ?? null).toBe(expected);
  });
});

describe('nextRateOf', () => {
  it.each([
    [1, 'slower', 0.9],
    [0.5, 'slower', 0.5],
    [0.9, 'faster', 1],
    [1, 'faster', 1],
    [0.75, 'slower', 0.9],
  ] as const)('%s %s is %s', (rate, direction, expected) => {
    expect(nextRateOf(rate, direction)).toBe(expected);
  });
});
