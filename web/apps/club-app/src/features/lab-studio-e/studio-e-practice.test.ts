import { describe, expect, it } from 'vitest';
import type { StudioStep } from '@/features/acts/schemas';
import {
  loopShareOf,
  nextRateOf,
  progressStopsOf,
  shownStepOf,
  skipTargetOf,
  snappedSeekOf,
} from './studio-e-practice';

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
    [0.6, 1],
  ])('after %s comes %s', (rate, next) => {
    expect(nextRateOf(rate)).toBe(next);
  });
});

describe('progressStopsOf', () => {
  it('places the timed steps as shares of the music', () => {
    expect(progressStopsOf(steps, 40)).toEqual([
      { stepId: 1, start: 0.05, end: 0.25 },
      { stepId: 2, start: 0.25, end: 0.5 },
      { stepId: 3, start: 0.6, end: 0.75 },
    ]);
  });

  it('places nothing without music', () => {
    expect(progressStopsOf(steps, 0)).toEqual([]);
  });
});

describe('snappedSeekOf', () => {
  it.each([
    [0.3, 10],
    [0.55, 22],
    [-1, 0],
    [2, 40],
  ])('a tap at %s lands on %s s', (share, seconds) => {
    expect(snappedSeekOf(steps, share, 40)).toBe(seconds);
  });
});

describe('loopShareOf', () => {
  it('turns the loop into shares of the music', () => {
    expect(loopShareOf({ start: 10, end: 20 }, 40)).toEqual({ start: 0.25, end: 0.5 });
  });

  it('has no share without a loop', () => {
    expect(loopShareOf(null, 40)).toBeNull();
  });
});
