import { distanceBetween, midpointOf } from './plan-geometry';
import type { Point } from './schemas';

const CENTIMETRES_PER_METRE = 100;

export interface Measurement {
  from: Point;
  to: Point;
  distanceCm: number;
  labelAt: Point;
}

const METRES = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatDistance = (centimetres: number): string => {
  const rounded = Math.round(centimetres);

  return rounded < CENTIMETRES_PER_METRE
    ? `${rounded} cm`
    : `${METRES.format(centimetres / CENTIMETRES_PER_METRE)} m`;
};

export const measure = (from: Point, to: Point): Measurement => ({
  from,
  to,
  distanceCm: distanceBetween(from, to),
  labelAt: midpointOf(from, to),
});
