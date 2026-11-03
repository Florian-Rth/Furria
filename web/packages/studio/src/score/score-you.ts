import type { ScoreStep } from '@furria/studio/score-steps';

export const rememberedStepOf = (
  steps: readonly ScoreStep[],
  stored: string | null,
): ScoreStep | null => {
  const stepId = stored === null ? Number.NaN : Number(stored);

  return steps.find((step) => step.stepId === stepId && step.range !== null) ?? null;
};

export const paneStepIdOf = (
  picked: number | null,
  playing: number | null,
  fallback: number | null,
): number | null => picked ?? playing ?? fallback;
