import type { StudioStep } from '@/features/acts/schemas';

export const unnamedStepNameOf = (number: number): string => `Schritt ${number}`;

export const shownStepNameOf = (name: string, number: number): string =>
  name.trim() === '' ? unnamedStepNameOf(number) : name;

export const stepNumberOf = (steps: readonly StudioStep[], stepId: number): number =>
  steps.findIndex((step) => step.stepId === stepId) + 1;
