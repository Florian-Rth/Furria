import type { TimelineRange } from '@/features/act-player/music-timeline';
import { partOfStep, partRangeOf, stepAt, stepRangeOf } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';

export type LoopScope = 'step' | 'part' | 'off' | 'other';

export type StepDirection = 'previous' | 'next';

export const RATES = [0.5, 0.6, 0.7, 0.8, 0.9, 1] as const;

const MATCH_TOLERANCE = 0.001;

const sameRange = (left: TimelineRange | null, right: TimelineRange | null): boolean =>
  left !== null &&
  right !== null &&
  Math.abs(left.start - right.start) < MATCH_TOLERANCE &&
  Math.abs(left.end - right.end) < MATCH_TOLERANCE;

export const currentStepOf = (steps: readonly StudioStep[], seconds: number): StudioStep | null => {
  const playing = stepAt(steps, seconds);

  if (playing !== null) {
    return playing;
  }

  const first = steps[0];

  if (first !== undefined && seconds < (first.startSeconds ?? 0)) {
    return first;
  }

  return steps.at(-1) ?? null;
};

const partRangeOfStep = (
  step: StudioStep,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): TimelineRange | null => {
  const part = partOfStep(parts, step.stepId);

  return part === null ? null : partRangeOf(part, steps);
};

export const loopScopeOf = (
  loop: TimelineRange | null,
  step: StudioStep | null,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): LoopScope => {
  if (loop === null) {
    return 'off';
  }
  if (step === null) {
    return 'other';
  }
  if (sameRange(loop, stepRangeOf(step))) {
    return 'step';
  }

  return sameRange(loop, partRangeOfStep(step, parts, steps)) ? 'part' : 'other';
};

export const practiceLoopOf = (
  scope: LoopScope,
  step: StudioStep,
  parts: readonly StudioPart[],
  steps: readonly StudioStep[],
): TimelineRange | null => {
  switch (scope) {
    case 'step':
      return stepRangeOf(step);
    case 'part':
      return partRangeOfStep(step, parts, steps) ?? stepRangeOf(step);
    case 'off':
    case 'other':
      return null;
  }
};

export const pickedScopeOf = (scope: LoopScope): LoopScope => (scope === 'part' ? 'part' : 'step');

export const neighbourOf = (
  steps: readonly StudioStep[],
  stepId: number | null,
  direction: StepDirection,
): StudioStep | null => {
  const index = steps.findIndex((step) => step.stepId === stepId);

  if (index < 0) {
    return null;
  }

  return steps[direction === 'next' ? index + 1 : index - 1] ?? null;
};

export const nextRateOf = (rate: number, direction: 'slower' | 'faster'): number => {
  const index = RATES.findIndex((candidate) => Math.abs(candidate - rate) < MATCH_TOLERANCE);
  const from = index < 0 ? RATES.length - 1 : index;
  const to = direction === 'slower' ? Math.max(0, from - 1) : Math.min(RATES.length - 1, from + 1);

  return RATES[to] ?? rate;
};
