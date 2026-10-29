import type { StudioStep } from '@/features/acts/schemas';

const RESTART_GRACE_SECONDS = 1.5;
const PRACTICE_RATES: readonly number[] = [1, 0.85, 0.7, 0.5];
const RATE_TOLERANCE = 1e-6;

export type SkipDirection = 'back' | 'forward';

const startOf = (step: StudioStep): number => step.startSeconds ?? 0;

const endOf = (step: StudioStep): number => step.endSeconds ?? startOf(step);

const isTimed = (step: StudioStep): boolean =>
  step.startSeconds !== null && step.endSeconds !== null;

export const currentStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null =>
  steps.find((step) => isTimed(step) && seconds >= startOf(step) && seconds < endOf(step)) ?? null;

export const shownStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null => {
  const timed = steps.filter(isTimed);

  return (
    currentStepOf(timed, seconds) ??
    timed.find((step) => startOf(step) > seconds) ??
    timed.at(-1) ??
    null
  );
};

const previousOf = (timed: readonly StudioStep[], seconds: number): StudioStep | null =>
  timed.findLast((step) => startOf(step) < seconds) ?? null;

export const skipTargetOf = (
  steps: readonly StudioStep[],
  seconds: number,
  direction: SkipDirection,
): StudioStep | null => {
  const timed = steps.filter(isTimed);
  const current = currentStepOf(timed, seconds);

  if (direction === 'forward') {
    return timed.find((step) => startOf(step) > seconds) ?? null;
  }

  if (current !== null && seconds - startOf(current) > RESTART_GRACE_SECONDS) {
    return current;
  }

  const before = previousOf(timed, current === null ? seconds : startOf(current));

  return before ?? current ?? timed[0] ?? null;
};

export const nextRateOf = (rate: number): number =>
  PRACTICE_RATES.find((candidate) => candidate < rate - RATE_TOLERANCE) ?? 1;

export const ratePercentOf = (rate: number): number => Math.round(rate * 100);
