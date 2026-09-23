import type { GlassDropDirection, GlassDropMotionAct } from './glass-drop-plan';

export type GlassBeadRole = 'leave' | 'arrive' | 'wobble';

export interface GlassDropTiming {
  times: number[];
  duration: number;
  delay: number;
}

export interface GlassBeadPath extends GlassDropTiming {
  y: number[];
  scaleX: number[];
  scaleY: number[];
  opacity: number[];
}

export interface GlassSkinPath extends GlassDropTiming {
  opacity: number[];
}

export interface GlassPillPath extends GlassDropTiming {
  scaleX: number[];
  scaleY: number[];
}

export interface GlassSheenPath {
  from: string;
  to: string;
  delay: number;
  duration: number;
}

export interface GlassSprayDrop {
  x: number;
  y: number;
  size: number;
}

interface GlassBeadShape extends GlassDropTiming {
  y: number[];
  scaleX: number[];
  scaleY: number[];
  opacity: number[];
}

const BEAD_SHAPES: Record<GlassBeadRole, GlassBeadShape> = {
  leave: {
    y: [0, 9, 62, 70],
    scaleX: [1, 0.76, 0.9, 1.6],
    scaleY: [1, 1.48, 1.02, 1.6],
    opacity: [1, 1, 1, 0],
    times: [0, 0.4, 0.86, 1],
    duration: 0.7,
    delay: 0,
  },
  arrive: {
    y: [-58, 0, 0, 0, 0],
    scaleX: [0.6, 1.32, 0.88, 1.05, 1],
    scaleY: [1.38, 0.72, 1.12, 0.97, 1],
    opacity: [0, 1, 1, 1, 1],
    times: [0, 0.42, 0.6, 0.8, 1],
    duration: 0.84,
    delay: 0.2,
  },
  wobble: {
    y: [0, 5, -2, 1, 0],
    scaleX: [1, 1.24, 0.88, 1.05, 1],
    scaleY: [1, 0.78, 1.12, 0.97, 1],
    opacity: [1, 1, 1, 1, 1],
    times: [0, 0.24, 0.5, 0.76, 1],
    duration: 0.72,
    delay: 0,
  },
};

const SKINS: Record<GlassBeadRole, GlassSkinPath> = {
  leave: { opacity: [1, 1], times: [0, 1], duration: 0.7, delay: 0 },
  arrive: { opacity: [1, 1, 0], times: [0, 0.66, 1], duration: 1.05, delay: 0.2 },
  wobble: { opacity: [0, 1, 1, 0], times: [0, 0.14, 0.62, 1], duration: 0.9, delay: 0 },
};

const LANDING_SECONDS: Record<GlassDropMotionAct, number> = {
  exchange: 0.55,
  wobble: 0.06,
  wave: 0.04,
};

const PILL_SCALE_X = [1, 1.012, 0.994, 1.003, 1];
const PILL_SCALE_Y = [1, 0.955, 1.028, 0.992, 1];
const PILL_TIMES = [0, 0.2, 0.48, 0.74, 1];
const PILL_DURATION = 0.6;
const WAVE_PILL_EASE = 0.4;

const SHEEN_START = '160%';
const SHEEN_END = '-60%';
const SHEEN_SECONDS = 0.85;

const SPRAY_COUNT = 7;
const SPRAY_TURN = Math.PI * 2;
const SPRAY_TILT = 0.35;
const SPRAY_NEAR = 22;
const SPRAY_FAR = 38;
const SPRAY_SMALL = 6;
const SPRAY_LARGE = 11;
const BURST_DEPTH = 70;

export const beadPathOf = (role: GlassBeadRole, direction: GlassDropDirection): GlassBeadPath => {
  const shape = BEAD_SHAPES[role];

  return { ...shape, y: shape.y.map((offset) => offset * direction + 0) };
};

export const skinPathOf = (role: GlassBeadRole): GlassSkinPath => SKINS[role];

export const landingSecondsOf = (act: GlassDropMotionAct): number => LANDING_SECONDS[act];

export const pillPathOf = (act: GlassDropMotionAct): GlassPillPath => {
  const softness = act === 'wave' ? WAVE_PILL_EASE : 1;
  const soften = (scale: number): number => 1 + (scale - 1) * softness;

  return {
    scaleX: PILL_SCALE_X.map(soften),
    scaleY: PILL_SCALE_Y.map(soften),
    times: PILL_TIMES,
    duration: PILL_DURATION,
    delay: LANDING_SECONDS[act],
  };
};

export const sheenPathOf = (
  act: GlassDropMotionAct,
  direction: GlassDropDirection,
): GlassSheenPath => {
  const forward = direction === 1;

  return {
    from: forward ? SHEEN_START : SHEEN_END,
    to: forward ? SHEEN_END : SHEEN_START,
    delay: LANDING_SECONDS[act],
    duration: SHEEN_SECONDS,
  };
};

export const burstDepthOf = (direction: GlassDropDirection): number => BURST_DEPTH * direction;

export const sprayOf = (direction: GlassDropDirection): readonly GlassSprayDrop[] =>
  Array.from({ length: SPRAY_COUNT }, (_, index) => {
    const angle = (index / SPRAY_COUNT) * SPRAY_TURN + SPRAY_TILT;
    const reach = index % 2 === 0 ? SPRAY_FAR : SPRAY_NEAR;
    const size = index % 3 === 0 ? SPRAY_LARGE : SPRAY_SMALL;

    return {
      x: Math.round(Math.cos(angle) * reach),
      y: Math.round(BURST_DEPTH * direction + Math.sin(angle) * reach),
      size,
    };
  });
