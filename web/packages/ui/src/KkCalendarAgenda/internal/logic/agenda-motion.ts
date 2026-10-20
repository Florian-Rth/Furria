const LEAD_SECONDS = 0.06;
const STEP_SECONDS = 0.045;
const STAGGERED_ROWS = 16;

export const rowDelayOf = (order: number): number =>
  LEAD_SECONDS + Math.min(Math.max(order, 0), STAGGERED_ROWS) * STEP_SECONDS;
