import type { StudioStep } from '@/features/acts/schemas';

export interface LessonNextStep {
  step: StudioStep;
  number: number;
}

export const nextStepOf = (
  steps: readonly StudioStep[],
  stepId: number | null,
): LessonNextStep | null => {
  if (stepId === null) {
    return null;
  }

  const index = steps.findIndex((step) => step.stepId === stepId);
  const step = index < 0 ? undefined : steps[index + 1];

  return step === undefined ? null : { step, number: index + 2 };
};
