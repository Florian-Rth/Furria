import type { InertiaOptions } from 'motion/react';

export interface PanBounds {
  min: number;
  max: number;
}

const RUBBER_STIFFNESS = 0.55;
const MS_PER_SECOND = 1000;
const MOMENTUM_POWER = 0.6;
const MOMENTUM_TIME_CONSTANT_MS = 325;
const BOUNCE_STIFFNESS = 420;
const BOUNCE_DAMPING = 38;
const RESTING_DELTA = 0.5;

export const rubberBand = (overshoot: number, dimension: number): number => {
  if (dimension <= 0 || overshoot === 0) {
    return 0;
  }
  const reach = (1 - 1 / ((Math.abs(overshoot) * RUBBER_STIFFNESS) / dimension + 1)) * dimension;

  return Math.sign(overshoot) * reach;
};

export const clampToBounds = (value: number, bounds: PanBounds): number =>
  Math.min(Math.max(value, bounds.min), Math.max(bounds.min, bounds.max));

export const rubberFollow = (raw: number, bounds: PanBounds, dimension: number): number => {
  const resting = clampToBounds(raw, bounds);

  return resting + rubberBand(raw - resting, dimension);
};

export const rubberScale = (raw: number, bounds: PanBounds): number => {
  if (raw <= 0 || bounds.min <= 0) {
    return clampToBounds(raw, bounds);
  }
  const resting = clampToBounds(raw, bounds);
  const overshoot = Math.log(raw / resting);

  return resting * Math.exp(rubberBand(overshoot, 1));
};

export const momentumTargetOf = (from: number, momentum: InertiaOptions): number =>
  from + (momentum.power ?? 0) * (momentum.velocity ?? 0);

export const momentumOf = (velocityPerMs: number, bounds: PanBounds): InertiaOptions => ({
  velocity: velocityPerMs * MS_PER_SECOND,
  min: bounds.min,
  max: Math.max(bounds.min, bounds.max),
  power: MOMENTUM_POWER,
  timeConstant: MOMENTUM_TIME_CONSTANT_MS,
  bounceStiffness: BOUNCE_STIFFNESS,
  bounceDamping: BOUNCE_DAMPING,
  restDelta: RESTING_DELTA,
});
