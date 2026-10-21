const FIRST_DAY_SECONDS = 0.18;
const DAY_STEP_SECONDS = 0.075;
const MARK_STEP_SECONDS = 0.045;

export const toMarkDelaySeconds = (dayIndex: number, markIndex: number): number =>
  FIRST_DAY_SECONDS +
  Math.max(0, dayIndex) * DAY_STEP_SECONDS +
  Math.max(0, markIndex) * MARK_STEP_SECONDS;

export const toDayDelaySeconds = (dayIndex: number): number =>
  FIRST_DAY_SECONDS + Math.max(0, dayIndex) * DAY_STEP_SECONDS;
