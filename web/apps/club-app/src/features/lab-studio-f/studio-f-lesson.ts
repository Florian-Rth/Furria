import { partOfStep } from '@/features/act-player/music-timeline';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';

export type StudioFTurn = 'forward' | 'back';

export type StudioFView = 'video' | 'stage';

export type StudioFSegmentState = 'done' | 'current' | 'ahead';

export const STUDIO_F_RATES = [0.5, 0.75, 1] as const;

const NO_STEP = -1;

export const followedStepIndexOf = (steps: readonly StudioStep[], seconds: number): number => {
  if (steps.length === 0) {
    return NO_STEP;
  }

  const started = steps.findLastIndex(
    (step) => step.startSeconds !== null && step.startSeconds <= seconds,
  );

  return Math.max(0, started);
};

export const neighbourIndexOf = (index: number, count: number, delta: number): number | null => {
  const target = index + delta;

  return target >= 0 && target < count ? target : null;
};

export const turnOf = (from: number, to: number): StudioFTurn => (to < from ? 'back' : 'forward');

export const stepFillOf = (step: StudioStep | null, seconds: number): number => {
  if (step === null || step.startSeconds === null || step.endSeconds === null) {
    return 0;
  }

  const span = step.endSeconds - step.startSeconds;

  if (span <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, (seconds - step.startSeconds) / span));
};

export const segmentStateOf = (index: number, current: number): StudioFSegmentState => {
  if (index === current) {
    return 'current';
  }

  return index < current ? 'done' : 'ahead';
};

export const shownViewOf = (chosen: StudioFView, hasVideo: boolean): StudioFView =>
  chosen === 'video' && !hasVideo ? 'stage' : chosen;

export const rateIdOf = (rate: number): string => `${Math.round(rate * 100)}`;

export const rateOfId = (id: string): number => {
  const rate = STUDIO_F_RATES.find((candidate) => rateIdOf(candidate) === id);

  return rate ?? 1;
};

export const nearestRateOf = (rate: number): number =>
  STUDIO_F_RATES.reduce((best, candidate) =>
    Math.abs(candidate - rate) < Math.abs(best - rate) ? candidate : best,
  );

export const stepNumberOf = (index: number): string => `${index + 1}`.padStart(2, '0');

export const opensPartAt = (
  steps: readonly StudioStep[],
  parts: readonly StudioPart[],
  index: number,
): boolean => {
  const step = steps[index];
  const before = steps[index - 1];

  if (step === undefined || before === undefined) {
    return false;
  }

  return partOfStep(parts, step.stepId)?.partId !== partOfStep(parts, before.stepId)?.partId;
};
