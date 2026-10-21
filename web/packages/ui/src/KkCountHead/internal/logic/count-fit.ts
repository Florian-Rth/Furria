const MAX_SCALE = 1.25;
const NO_SCALE = 1;

export const countScaleOf = (room: number, face: number): number =>
  face <= 0 ? NO_SCALE : Math.min(Math.max(room / face, NO_SCALE), MAX_SCALE);
