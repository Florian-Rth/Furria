import type { StudioStep } from '@/features/acts/schemas';

const HINTED_VISITS = 3;

export const PRACTICE_HINT_VISITS_KEY = 'furria.practice.hintVisits';

export const practiceMemoryKeyOf = (actId: number, personId: number | null): string =>
  `furria.practice.${personId ?? 'guest'}.${actId}.step`;

export const rememberedStepStartOf = (
  steps: readonly StudioStep[],
  stored: string | null,
): number | null => {
  const stepId = stored === null ? Number.NaN : Number(stored);

  return steps.find((step) => step.stepId === stepId)?.startSeconds ?? null;
};

export const hintVisitsOf = (stored: string | null): number => {
  const visits = stored === null ? Number.NaN : Number(stored);

  return Number.isInteger(visits) && visits > 0 ? visits : 0;
};

export const isHintedVisit = (earlierVisits: number): boolean => earlierVisits < HINTED_VISITS;
