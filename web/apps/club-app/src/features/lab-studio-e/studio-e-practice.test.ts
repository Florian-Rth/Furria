import { describe, expect, it } from 'vitest';
import type { StudioStep } from '@/features/acts/schemas';
import { nextRateOf, shownStepOf, skipTargetOf } from './studio-e-practice';

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

const steps: StudioStep[] = [step(1, 2, 10), step(2, 10, 20), step(3, 24, 30), step(4, null, null)];

describe('shownStepOf', () => {
  it.each([
    [0, 1],
    [5, 1],
    [10, 2],
    [21, 3],
    [40, 3],
  ])('at %s s shows step %s', (seconds, stepId) => {
    expect(shownStepOf(steps, seconds)?.stepId).toBe(stepId);
  });

  it('shows nothing without timed steps', () => {
    expect(shownStepOf([step(9, null, null)], 3)).toBeNull();
  });
});

describe('skipTargetOf', () => {
  it.each([
    [12, 'back', 2],
    [10.5, 'back', 1],
    [3, 'back', 1],
    [0, 'back', 1],
    [22, 'back', 2],
    [12, 'forward', 3],
    [0, 'forward', 1],
    [22, 'forward', 3],
  ] as const)('at %s s %s goes to step %s', (seconds, direction, stepId) => {
    expect(skipTargetOf(steps, seconds, direction)?.stepId).toBe(stepId);
  });

  it('has no next step after the last one', () => {
    expect(skipTargetOf(steps, 26, 'forward')).toBeNull();
  });
});

describe('nextRateOf', () => {
  it.each([
    [1, 0.85],
    [0.85, 0.7],
    [0.7, 0.5],
    [0.5, 1],
    [0.6, 0.5],
    [0.75, 0.7],
  ])('after %s comes %s', (rate, next) => {
    expect(nextRateOf(rate)).toBe(next);
  });
});
