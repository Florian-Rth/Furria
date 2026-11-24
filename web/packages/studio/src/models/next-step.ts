import type { StudioStep } from '@furria/studio/studio-schemas';

export interface NextStep {
  step: StudioStep;
  number: number;
}

export const nextStepOf = (
  steps: readonly StudioStep[],
  stepId: number | null,
): NextStep | null => {
  const index = steps.findIndex((step) => step.stepId === stepId);
  const nextIndex = index < 0 ? 0 : index + 1;
  const step = steps[nextIndex];

  return step === undefined ? null : { step, number: nextIndex + 1 };
};
