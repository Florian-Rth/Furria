export type KkWayPipCorner = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

const HALF = 0.5;
const TAP_TRAVEL_PX = 8;

export const nearestCornerOf = (xShare: number, yShare: number): KkWayPipCorner => {
  const top = yShare < HALF;
  const left = xShare < HALF;

  if (top) {
    return left ? 'topLeft' : 'topRight';
  }

  return left ? 'bottomLeft' : 'bottomRight';
};

export const isTap = (dx: number, dy: number): boolean => Math.hypot(dx, dy) < TAP_TRAVEL_PX;

export const isRight = (corner: KkWayPipCorner): boolean =>
  corner === 'topRight' || corner === 'bottomRight';

export const isBottom = (corner: KkWayPipCorner): boolean =>
  corner === 'bottomLeft' || corner === 'bottomRight';
