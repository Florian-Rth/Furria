import type { TimedStudioStep } from '@furria/studio/music-timeline';
import { isStepOnTimeline } from '@furria/studio/music-timeline';
import type { StudioStep } from '@furria/studio/studio-schemas';

const RESTART_GRACE_SECONDS = 1.5;
export const PRACTICE_RATES: readonly number[] = [1, 0.85, 0.7, 0.5];
const RATE_TOLERANCE = 1e-6;

export type SkipDirection = 'back' | 'forward';

export const currentStepOf = (
  steps: readonly StudioStep[],
  seconds: number,
): TimedStudioStep | null =>
  steps
    .filter(isStepOnTimeline)
    .find((step) => seconds >= step.startSeconds && seconds < step.endSeconds) ?? null;

export const shownStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null =>
  currentStepOf(steps, seconds);

export const followingStepOf = (
  steps: readonly StudioStep[],
  seconds: number,
): TimedStudioStep | null =>
  steps.filter(isStepOnTimeline).find((step) => step.startSeconds > seconds) ?? null;

export const hasTimedSteps = (steps: readonly StudioStep[]): boolean =>
  steps.some(isStepOnTimeline);

const previousOf = (timed: readonly TimedStudioStep[], seconds: number): StudioStep | null =>
  timed.findLast((step) => step.startSeconds < seconds) ?? null;

export const skipTargetOf = (
  steps: readonly StudioStep[],
  seconds: number,
  direction: SkipDirection,
): StudioStep | null => {
  const timed = steps.filter(isStepOnTimeline);
  const current = currentStepOf(timed, seconds);

  if (direction === 'forward') {
    return followingStepOf(timed, seconds);
  }

  if (current !== null && seconds - current.startSeconds > RESTART_GRACE_SECONDS) {
    return current;
  }

  const before = previousOf(timed, current === null ? seconds : current.startSeconds);

  return before ?? current ?? timed[0] ?? null;
};

export const nextRateOf = (rate: number): number =>
  PRACTICE_RATES.find((candidate) => candidate < rate - RATE_TOLERANCE) ?? 1;

export const ratePercentOf = (rate: number): number => Math.round(rate * 100);

export const steppedRateOf = (
  rates: readonly number[],
  rate: number,
  command: 'faster' | 'slower',
): number => {
  const ascending = [...rates].sort((left, right) => left - right);

  if (command === 'faster') {
    return (
      ascending.find((candidate) => candidate > rate + RATE_TOLERANCE) ?? ascending.at(-1) ?? rate
    );
  }

  return (
    ascending.findLast((candidate) => candidate < rate - RATE_TOLERANCE) ?? ascending[0] ?? rate
  );
};
