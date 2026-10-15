export interface HonourPoint {
  x: number;
  y: number;
}

export interface HonourArc {
  startDegrees: number;
  endDegrees: number;
}

const FULL_TURN = 360;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const DECIMALS = 2;

const rounded = (value: number): number => Number(value.toFixed(DECIMALS)) + 0;

export const pointOn = (center: number, radius: number, degrees: number): HonourPoint => {
  const radians = degrees / DEGREES_PER_RADIAN;

  return {
    x: rounded(center + radius * Math.sin(radians)),
    y: rounded(center - radius * Math.cos(radians)),
  };
};

export const arcPath = (center: number, radius: number, arc: HonourArc): string => {
  const from = pointOn(center, radius, arc.startDegrees);
  const to = pointOn(center, radius, arc.endDegrees);
  const largeArc = arc.endDegrees - arc.startDegrees > FULL_TURN / 2 ? 1 : 0;

  return `M${from.x} ${from.y}A${radius} ${radius} 0 ${largeArc} 1 ${to.x} ${to.y}`;
};

export const circlePath = (center: number, radius: number): string => {
  const top = rounded(center - radius);
  const bottom = rounded(center + radius);

  return `M${center} ${top}A${radius} ${radius} 0 1 1 ${center} ${bottom}A${radius} ${radius} 0 1 1 ${center} ${top}`;
};

export const pieceArcs = (pieces: number, radius: number, gap: number): HonourArc[] => {
  if (pieces <= 0 || radius <= 0) {
    return [];
  }

  const span = FULL_TURN / pieces;
  const gapDegrees = (gap / radius) * DEGREES_PER_RADIAN;

  return Array.from({ length: pieces }, (_, index) => ({
    startDegrees: rounded(index * span + gapDegrees / 2),
    endDegrees: rounded((index + 1) * span - gapDegrees / 2),
  }));
};

export const bearingOf = (dx: number, dy: number): number => {
  const degrees = Math.atan2(dx, -dy) * DEGREES_PER_RADIAN;

  return degrees < 0 ? degrees + FULL_TURN : degrees;
};

export const pieceIndexAt = (degrees: number, pieces: number): number =>
  Math.min(pieces - 1, Math.max(0, Math.floor(degrees / (FULL_TURN / pieces))));

export const percentOn = (radiusShare: number, degrees: number): HonourPoint =>
  pointOn(50, radiusShare * 100, degrees);

export const placeTransformOf = (x: number, y: number, scale: number): string =>
  `translate(${x} ${y}) scale(${rounded(scale * 1000) / 1000})`;

export const tiltTransformOf = (degrees: number, center: number): string =>
  `rotate(${degrees} ${center} ${center})`;

export const coinSpotsOf = (
  count: number,
  radiusShare: number,
  startDegrees: number,
  stepDegrees: number,
): HonourPoint[] =>
  Array.from({ length: Math.max(count, 0) }, (_, index) =>
    percentOn(radiusShare, startDegrees + index * stepDegrees),
  );
