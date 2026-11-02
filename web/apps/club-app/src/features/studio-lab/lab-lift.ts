import type { GesturePoint } from '@furria/studio/gesture-recogniser';

export interface LabLoupeSpec {
  diameter: number;
  zoom: number;
}

export interface LabLoupe {
  x: number;
  y: number;
  contentX: number;
  contentY: number;
}

export interface LabLift {
  readout: GesturePoint;
  loupe: LabLoupe | null;
}

export const LIFT_GAP = 64;
export const READOUT_HEIGHT = 34;
const READOUT_SPACING = 10;

const clamp = (value: number, min: number, max: number): number =>
  min > max ? (min + max) / 2 : Math.min(Math.max(value, min), max);

export const labLiftOf = (
  finger: GesturePoint,
  areaWidth: number,
  readoutWidth: number,
  loupe: LabLoupeSpec | null,
  roomAbove: number,
): LabLift => {
  const readoutX = clamp(finger.x, readoutWidth / 2, areaWidth - readoutWidth / 2);
  const radius = loupe === null ? 0 : loupe.diameter / 2;
  const liftedHeight =
    loupe === null ? READOUT_HEIGHT : loupe.diameter + READOUT_SPACING + READOUT_HEIGHT;
  const above = finger.y - LIFT_GAP - liftedHeight >= -roomAbove;
  const side = above ? -1 : 1;
  const loupeY = finger.y + side * (LIFT_GAP + radius);
  const readoutY =
    loupe === null
      ? finger.y + side * (LIFT_GAP + READOUT_HEIGHT / 2)
      : loupeY + side * (radius + READOUT_SPACING + READOUT_HEIGHT / 2);

  return {
    readout: { x: readoutX, y: readoutY },
    loupe:
      loupe === null
        ? null
        : {
            x: clamp(finger.x, radius, areaWidth - radius),
            y: loupeY,
            contentX: radius - finger.x * loupe.zoom,
            contentY: radius - finger.y * loupe.zoom,
          },
  };
};
