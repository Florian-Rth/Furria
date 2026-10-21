const LEAD_MS = 120;
const STEP_MS = 85;
const LAST_ORDER = 9;
const MILLISECONDS = 1000;

export const tileLandDelayMs = (order: number): number =>
  LEAD_MS + Math.min(Math.max(order, 0), LAST_ORDER) * STEP_MS;

export const tileLandDelaySeconds = (order: number, after = 0): number =>
  (tileLandDelayMs(order) + after) / MILLISECONDS;
