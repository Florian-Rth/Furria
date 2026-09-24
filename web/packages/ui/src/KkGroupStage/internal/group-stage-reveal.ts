export const GROUP_STAGE_REVEAL_SECONDS = 0.72;
export const GROUP_STAGE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

export const GROUP_STAGE_STEPS = {
  eyebrow: 0,
  title: 1,
  standing: 2,
  meta: 3,
} as const;

const BASE_DELAY_SECONDS = 0.08;
const STEP_DELAY_SECONDS = 0.14;
const FIRST_STEP = 0;

export const groupStageDelayOf = (step: number): number =>
  BASE_DELAY_SECONDS + Math.max(step, FIRST_STEP) * STEP_DELAY_SECONDS;
