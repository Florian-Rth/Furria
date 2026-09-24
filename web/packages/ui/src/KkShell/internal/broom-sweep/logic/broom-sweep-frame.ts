import type { BroomSweepPlan } from './broom-sweep-plan';
import { moteOpacityVar, moteVar, SWEEP_VAR } from './broom-sweep-vars';

export type BroomSweepMode = 'sweep' | 'fade';

export interface BroomSweepGeometry {
  textLeft: number;
  markCenter: number;
  span: number;
  room: number;
}

export type BroomSweepFrame = Record<string, string>;

export interface FoldPose {
  left: number;
  right: number;
  bristle: number;
  reach: number;
  thick: number;
  shift: number;
  ink: number;
}

export const MOTE_COUNT = 18;

const SWEEP_SECONDS = 1.05;
const FADE_SECONDS = 0.22;

const CROSSED = 122;
const SPREAD = 108;
const CHEVRON_LEFT = -225;
const CHEVRON_RIGHT = 45;
const FOLD_OVERSHOOT = 1.6;
const CHEVRON_REACH = 0.58;
const CHEVRON_THICK = 1.35;
const CHEVRON_SHIFT = -9.6;

const SWEEP_START = 0.1;
const SWEEP_END = 0.74;
const EDGE_WIPE = -12;
const FAR_OVERSHOOT = 14;
const TRAIL_LEAD = 6;
const SWEEP_TILT = 24;
const STROKE_TILT = 10;
const STROKE_BOB = 2.5;
const STROKES = 5;

const MOTE_FIRST = 0.14;
const MOTE_LAST = 0.7;
const MOTE_LIFE = 0.24;
const MOTE_FLOOR = 8;
const MOTE_GRAVITY = 22;

const HIDDEN = '0';
const SHOWN = '1';
const UNTOUCHED = 'none';
const FULL_INSET = '-40%';
const OPEN_INSET = '-200%';
const GLYPH_BLEED = '-12px';

export const durationOf = (mode: BroomSweepMode): number =>
  mode === 'fade' ? FADE_SECONDS : SWEEP_SECONDS;

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

export const ramp = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const easeInOut = (amount: number): number =>
  amount < 0.5 ? 4 * amount ** 3 : 1 - (-2 * amount + 2) ** 3 / 2;

const easeOut = (amount: number): number => 1 - (1 - amount) ** 3;

const easeOutBack = (amount: number): number =>
  1 + (FOLD_OVERSHOOT + 1) * (amount - 1) ** 3 + FOLD_OVERSHOOT * (amount - 1) ** 2;

const noiseOf = (seed: number): number => {
  const wave = Math.sin(seed * 12.9898) * 43758.5453;
  return wave - Math.floor(wave);
};

export const foldPoseOf = (fold: number, spread: number): FoldPose => {
  const open = lerp(CROSSED, SPREAD, spread);

  return {
    left: lerp(-open, CHEVRON_LEFT, fold),
    right: lerp(open, CHEVRON_RIGHT, fold),
    bristle: 1 - ramp(fold, 0, 0.6),
    reach: lerp(1, CHEVRON_REACH, fold),
    thick: lerp(1, CHEVRON_THICK, fold),
    shift: lerp(0, CHEVRON_SHIFT, fold),
    ink: ramp(fold, 0.3, 1),
  };
};

const broomTransformOf = (angle: number, pose: FoldPose): string =>
  `translate(${pose.shift}px, 0px) translate(0px, 1px) rotate(${angle}deg) translate(0px, -1px) scale(${pose.thick}, ${pose.reach})`;

const bristleTransformOf = (pose: FoldPose): string =>
  `translate(0px, 6px) scale(${pose.bristle}) translate(0px, -6px)`;

const foldProgressOf = (p: number, plan: BroomSweepPlan): { fold: number; spread: number } =>
  plan.shift === 'fold'
    ? { fold: easeOutBack(ramp(p, 0.2, 0.62)), spread: easeOut(ramp(p, 0, 0.2)) }
    : { fold: 1 - easeOutBack(ramp(p, 0.56, 0.86)), spread: 1 - easeOut(ramp(p, 0.84, 0.98)) };

const foldFrameOf = (p: number, plan: BroomSweepPlan): BroomSweepFrame => {
  const { fold, spread } = foldProgressOf(p, plan);
  const pose = foldPoseOf(fold, spread);
  const folding = plan.shift === 'fold';
  const glyphOpacity = folding ? 1 - ramp(p, 0.7, 0.8) : 1;
  const markOpacity = folding ? ramp(p, 0.68, 0.78) : 0;
  const pop = 1 + 0.18 * Math.sin(Math.PI * ramp(p, 0.1, 0.62));

  return {
    [SWEEP_VAR.markOpacity]: String(markOpacity),
    [SWEEP_VAR.markTransform]: UNTOUCHED,
    [SWEEP_VAR.foldPop]: `scale(${pop})`,
    [SWEEP_VAR.foldBrandOpacity]: String(glyphOpacity * (1 - pose.ink)),
    [SWEEP_VAR.foldInkOpacity]: String(glyphOpacity * pose.ink),
    [SWEEP_VAR.foldLeft]: broomTransformOf(pose.left, pose),
    [SWEEP_VAR.foldRight]: broomTransformOf(pose.right, pose),
    [SWEEP_VAR.foldBristle]: bristleTransformOf(pose),
    [SWEEP_VAR.ghostGlyphOpacity]: HIDDEN,
  };
};

const signOf = (plan: BroomSweepPlan): number => (plan.direction === 'forward' ? 1 : -1);

const quietFold: BroomSweepFrame = {
  [SWEEP_VAR.foldBrandOpacity]: HIDDEN,
  [SWEEP_VAR.foldInkOpacity]: HIDDEN,
};

const flickFrameOf = (p: number, plan: BroomSweepPlan): BroomSweepFrame => {
  const kick = Math.sin(Math.PI * ramp(p, 0.02, 0.4));
  const markTransform =
    plan.from === 'broom'
      ? `rotate(${-18 * signOf(plan) * kick}deg) scale(${1 + 0.12 * kick})`
      : `translateX(${-4 * signOf(plan) * Math.sin(Math.PI * ramp(p, 0, 0.3))}px)`;

  return {
    ...quietFold,
    [SWEEP_VAR.markOpacity]: SHOWN,
    [SWEEP_VAR.markTransform]: markTransform,
    [SWEEP_VAR.ghostGlyphOpacity]: HIDDEN,
  };
};

const spinFrameOf = (p: number, plan: BroomSweepPlan): BroomSweepFrame => {
  const leaving = easeInOut(ramp(p, 0, 0.4));
  const arriving = easeOut(ramp(p, 0.3, 0.7));
  const sign = signOf(plan);

  return {
    ...quietFold,
    [SWEEP_VAR.ghostGlyph]: `rotate(${-sign * 90 * leaving}deg) scale(${1 - 0.4 * leaving})`,
    [SWEEP_VAR.ghostGlyphOpacity]: String(1 - leaving),
    [SWEEP_VAR.markOpacity]: String(arriving),
    [SWEEP_VAR.markTransform]: `rotate(${sign * 90 * (1 - arriving)}deg) scale(${0.6 + 0.4 * arriving})`,
  };
};

const markFrameOf = (p: number, plan: BroomSweepPlan): BroomSweepFrame => {
  if (plan.shift === 'flick') {
    return flickFrameOf(p, plan);
  }

  if (plan.shift === 'spin') {
    return spinFrameOf(p, plan);
  }

  return foldFrameOf(p, plan);
};

interface SweepPath {
  from: number;
  to: number;
  far: number;
}

export const sweepPathOf = (plan: BroomSweepPlan, geometry: BroomSweepGeometry): SweepPath => {
  const near = geometry.markCenter - geometry.textLeft;
  const far = geometry.span + FAR_OVERSHOOT;

  if (plan.direction === 'forward') {
    return { from: plan.shift === 'fold' ? near : EDGE_WIPE, to: far, far };
  }

  return { from: far, to: plan.shift === 'unfold' ? near : EDGE_WIPE, far };
};

const sweptAt = (p: number): number => easeInOut(ramp(p, SWEEP_START, SWEEP_END));

export const wipeAt = (p: number, path: SweepPath): number => lerp(path.from, path.to, sweptAt(p));

const sweeperScaleOf = (p: number, plan: BroomSweepPlan): number => {
  if (plan.shift === 'fold') {
    return lerp(0.4, 1, easeOut(ramp(p, 0.06, 0.2)));
  }

  if (plan.shift === 'unfold') {
    return 1 - 0.6 * ramp(p, 0.66, 0.8);
  }

  return 1;
};

export const clipBehindOf = (wipe: number, plan: BroomSweepPlan): string =>
  plan.direction === 'forward'
    ? `inset(${FULL_INSET} ${OPEN_INSET} ${FULL_INSET} ${Math.max(0, wipe)}px)`
    : `inset(${FULL_INSET} calc(100% - ${wipe}px) ${FULL_INSET} ${GLYPH_BLEED})`;

export const clipAheadOf = (wipe: number, plan: BroomSweepPlan): string =>
  plan.direction === 'forward'
    ? `inset(${FULL_INSET} calc(100% - ${wipe}px) ${FULL_INSET} ${GLYPH_BLEED})`
    : `inset(${FULL_INSET} ${OPEN_INSET} ${FULL_INSET} ${Math.max(0, wipe)}px)`;

const sweepFrameOf = (
  p: number,
  plan: BroomSweepPlan,
  geometry: BroomSweepGeometry,
): BroomSweepFrame => {
  const path = sweepPathOf(plan, geometry);
  const wipe = wipeAt(p, path);
  const sign = signOf(plan);
  const stroke = Math.sin(sweptAt(p) * Math.PI * STROKES);
  const tilt = -sign * SWEEP_TILT + STROKE_TILT * stroke;
  const bob = -STROKE_BOB * Math.abs(stroke);
  const sweeperOpacity = ramp(p, 0.06, 0.14) * (1 - ramp(p, 0.72, 0.8));
  const trailLeft = plan.direction === 'forward' ? -TRAIL_LEAD : wipe;
  const trailRight = plan.direction === 'forward' ? wipe : path.far;
  const trailOpacity = ramp(p, SWEEP_START, 0.2) * (1 - ramp(p, 0.55, 0.85));

  return {
    [SWEEP_VAR.textLeft]: `${geometry.textLeft}px`,
    [SWEEP_VAR.ghostRoom]: `${geometry.room}px`,
    [SWEEP_VAR.reveal]: clipAheadOf(wipe, plan),
    [SWEEP_VAR.revealOpacity]: SHOWN,
    [SWEEP_VAR.ghostClip]: clipBehindOf(wipe, plan),
    [SWEEP_VAR.ghostOpacity]: String(1 - ramp(p, SWEEP_END, 0.8)),
    [SWEEP_VAR.sweeper]: `translate(${geometry.textLeft + wipe}px, ${bob}px) translate(-50%, -50%) rotate(${tilt}deg) scale(${sweeperScaleOf(p, plan)})`,
    [SWEEP_VAR.sweeperOpacity]: String(sweeperOpacity),
    [SWEEP_VAR.trailLeft]: `${geometry.textLeft + trailLeft}px`,
    [SWEEP_VAR.trailWidth]: `${Math.max(0, trailRight - trailLeft)}px`,
    [SWEEP_VAR.trailOpacity]: String(trailOpacity),
    [SWEEP_VAR.trailAngle]: plan.direction === 'forward' ? '90deg' : '270deg',
  };
};

export interface MotePose {
  x: number;
  y: number;
  spin: number;
  scale: number;
  opacity: number;
}

export const motePoseOf = (
  index: number,
  p: number,
  plan: BroomSweepPlan,
  geometry: BroomSweepGeometry,
): MotePose => {
  const birth = lerp(MOTE_FIRST, MOTE_LAST, index / (MOTE_COUNT - 1));
  const age = ramp(p, birth, birth + MOTE_LIFE);
  const alive = p > birth && age < 1;
  const origin = geometry.textLeft + wipeAt(birth, sweepPathOf(plan, geometry));
  const drift = signOf(plan) * (16 + 30 * noiseOf(index));
  const lift = 10 + 18 * noiseOf(index + 17);
  const twirl = (noiseOf(index + 33) - 0.5) * 540;

  return {
    x: origin + drift * age,
    y: MOTE_FLOOR - lift * age + MOTE_GRAVITY * age ** 2,
    spin: twirl * age,
    scale: 1 - 0.5 * age,
    opacity: alive ? (1 - age) ** 2 : 0,
  };
};

const MOTE_INDICES = Array.from({ length: MOTE_COUNT }, (_, index) => index);

const motesFrameOf = (
  p: number,
  plan: BroomSweepPlan,
  geometry: BroomSweepGeometry,
): BroomSweepFrame =>
  Object.fromEntries(
    MOTE_INDICES.flatMap((index) => {
      const pose = motePoseOf(index, p, plan, geometry);
      return [
        [
          moteVar(index),
          `translate(${pose.x}px, ${pose.y}px) rotate(${pose.spin}deg) scale(${pose.scale})`,
        ],
        [moteOpacityVar(index), String(pose.opacity)],
      ];
    }),
  );

const fadeFrameOf = (
  p: number,
  plan: BroomSweepPlan,
  geometry: BroomSweepGeometry,
): BroomSweepFrame => {
  const glyphChanges = plan.shift !== 'flick';

  return {
    ...quietFold,
    [SWEEP_VAR.textLeft]: `${geometry.textLeft}px`,
    [SWEEP_VAR.ghostRoom]: `${geometry.room}px`,
    [SWEEP_VAR.reveal]: UNTOUCHED,
    [SWEEP_VAR.revealOpacity]: String(p),
    [SWEEP_VAR.ghostClip]: UNTOUCHED,
    [SWEEP_VAR.ghostOpacity]: String(1 - p),
    [SWEEP_VAR.ghostGlyph]: UNTOUCHED,
    [SWEEP_VAR.ghostGlyphOpacity]: glyphChanges ? String(1 - p) : HIDDEN,
    [SWEEP_VAR.markOpacity]: glyphChanges ? String(p) : SHOWN,
    [SWEEP_VAR.markTransform]: UNTOUCHED,
    [SWEEP_VAR.sweeperOpacity]: HIDDEN,
    [SWEEP_VAR.trailOpacity]: HIDDEN,
  };
};

export const broomSweepFrameOf = (
  p: number,
  plan: BroomSweepPlan,
  geometry: BroomSweepGeometry,
  mode: BroomSweepMode,
): BroomSweepFrame => {
  if (mode === 'fade') {
    return fadeFrameOf(p, plan, geometry);
  }

  return {
    ...markFrameOf(p, plan),
    ...sweepFrameOf(p, plan, geometry),
    ...motesFrameOf(p, plan, geometry),
  };
};
