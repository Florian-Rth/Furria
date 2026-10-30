const LEAD_SECONDS = 0.04;
const STEP_SECONDS = 0.05;
const STAGGERED_ROWS = 12;
const MARKER_LAG_SECONDS = 0.18;

export const agendaRowDelayOf = (order: number): number =>
  LEAD_SECONDS + Math.min(Math.max(order, 0), STAGGERED_ROWS) * STEP_SECONDS;

export const agendaMarkerDelayOf = (order: number): number =>
  agendaRowDelayOf(order) + MARKER_LAG_SECONDS;
