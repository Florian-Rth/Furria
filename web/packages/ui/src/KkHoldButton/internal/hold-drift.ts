const HOLD_DRIFT_PX = 10;

export interface HoldPoint {
  x: number;
  y: number;
}

export const hasHoldDrifted = (origin: HoldPoint, point: HoldPoint): boolean =>
  Math.hypot(point.x - origin.x, point.y - origin.y) > HOLD_DRIFT_PX;
