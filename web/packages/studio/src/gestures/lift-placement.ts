import type { GesturePoint } from './gesture-recogniser';

export interface LiftSize {
  width: number;
  height: number;
}

export type LiftSide = 'above' | 'below';

export interface LiftPlacement {
  x: number;
  y: number;
  side: LiftSide;
}

export interface LoupeView {
  placement: LiftPlacement;
  contentX: number;
  contentY: number;
  zoom: number;
}

export const LIFT_GAP = 56;
export const LOUPE_ZOOM = 2;

const clamp = (value: number, min: number, max: number): number =>
  min > max ? (min + max) / 2 : Math.min(Math.max(value, min), max);

export const liftPlacementOf = (
  finger: GesturePoint,
  area: LiftSize,
  lifted: LiftSize,
  gap: number = LIFT_GAP,
): LiftPlacement => {
  const halfWidth = lifted.width / 2;
  const halfHeight = lifted.height / 2;
  const x = clamp(finger.x, halfWidth, area.width - halfWidth);
  const above = finger.y - gap - halfHeight;
  if (above - halfHeight >= 0) {
    return { x, y: above, side: 'above' };
  }

  return { x, y: finger.y + gap + halfHeight, side: 'below' };
};

export const loupeOf = (
  finger: GesturePoint,
  area: LiftSize,
  diameter: number,
  zoom: number = LOUPE_ZOOM,
): LoupeView => {
  const placement = liftPlacementOf(finger, area, { width: diameter, height: diameter });
  const radius = diameter / 2;

  return {
    placement,
    contentX: radius - finger.x * zoom,
    contentY: radius - finger.y * zoom,
    zoom,
  };
};
