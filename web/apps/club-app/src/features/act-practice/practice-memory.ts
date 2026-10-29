import type { StudioStep } from '@/features/acts/schemas';

export const practiceMemoryKeyOf = (actId: number, personId: number | null): string =>
  `furria.practice.${personId ?? 'guest'}.${actId}.step`;

export const rememberedStepStartOf = (
  steps: readonly StudioStep[],
  stored: string | null,
): number | null => {
  const stepId = stored === null ? Number.NaN : Number(stored);

  return steps.find((step) => step.stepId === stepId)?.startSeconds ?? null;
};
