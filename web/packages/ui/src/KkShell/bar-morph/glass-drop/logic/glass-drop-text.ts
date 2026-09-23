import type { GlassDropDirection, GlassDropMotionAct, GlassDropPlan } from './glass-drop-plan';
import { motionActOf } from './glass-drop-plan';

export interface GlassWave {
  warp: readonly [number, number];
  blur: readonly [number, number];
  frequencyX: readonly [number, number];
  frequencyY: readonly [number, number];
  delay: number;
  duration: number;
}

export interface GlassRippleFrame {
  scale: number;
  deviation: number;
  frequency: string;
}

export interface GlassTextOffset {
  x: number;
  y: number;
}

export interface GlassTextCue {
  from: GlassTextOffset;
  delay: number;
  duration: number;
}

export interface GlassDropArrival extends GlassTextCue {
  wave: GlassWave | null;
}

export interface GlassDropDeparture {
  to: GlassTextOffset;
  duration: number;
  wave: GlassWave | null;
}

const ARRIVAL_DELAYS: Record<GlassDropMotionAct, number> = {
  exchange: 0.46,
  wobble: 0.1,
  wave: 0.06,
};

const arrivalWaveOf = (delay: number): GlassWave => ({
  warp: [26, 0],
  blur: [3.5, 0],
  frequencyX: [0.014, 0.022],
  frequencyY: [0.18, 0.05],
  delay,
  duration: 1,
});

const ARRIVAL_WAVES: Record<GlassDropMotionAct, GlassWave> = {
  exchange: arrivalWaveOf(ARRIVAL_DELAYS.exchange),
  wobble: arrivalWaveOf(ARRIVAL_DELAYS.wobble),
  wave: arrivalWaveOf(ARRIVAL_DELAYS.wave),
};

export const DEPARTURE_WAVE: GlassWave = {
  warp: [0, 34],
  blur: [0, 5],
  frequencyX: [0.022, 0.014],
  frequencyY: [0.05, 0.18],
  delay: 0,
  duration: 0.5,
};

const SINK = 9;
const DRIFT = 18;
const ARRIVAL_SECONDS = 0.5;
const DEPARTURE_SECONDS = 0.45;
const FADE_SECONDS = 0.16;
const STILL: GlassTextOffset = { x: 0, y: 0 };

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

export const rippleFrameAt = (wave: GlassWave, progress: number): GlassRippleFrame => ({
  scale: lerp(wave.warp[0], wave.warp[1], progress),
  deviation: lerp(wave.blur[0], wave.blur[1], progress),
  frequency: `${lerp(wave.frequencyX[0], wave.frequencyX[1], progress)} ${lerp(wave.frequencyY[0], wave.frequencyY[1], progress)}`,
});

export const arrivalWaveFor = (act: GlassDropMotionAct): GlassWave => ARRIVAL_WAVES[act];

const offsetOf = (
  act: GlassDropMotionAct,
  direction: GlassDropDirection,
  arriving: boolean,
): GlassTextOffset => {
  const sign = arriving ? 1 : -1;

  if (act === 'wave') {
    return { x: DRIFT * direction * sign, y: 0 };
  }

  return { x: 0, y: -SINK * direction * sign };
};

export const textArrivalOf = (
  act: GlassDropMotionAct,
  direction: GlassDropDirection,
): GlassTextCue => ({
  from: offsetOf(act, direction, true),
  delay: ARRIVAL_DELAYS[act],
  duration: ARRIVAL_SECONDS,
});

export const textDepartureOf = (
  act: GlassDropMotionAct,
  direction: GlassDropDirection,
): GlassTextOffset => offsetOf(act, direction, false);

export const filterIdOf = (reactId: string): string =>
  `kk-glass-drop-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

export const arrivalOf = (plan: GlassDropPlan): GlassDropArrival | null => {
  if (plan.act === 'settled') {
    return null;
  }

  const act = motionActOf(plan.act);

  if (act === null) {
    return { from: STILL, delay: 0, duration: FADE_SECONDS, wave: null };
  }

  return { ...textArrivalOf(act, plan.direction), wave: arrivalWaveFor(act) };
};

export const departureOf = (plan: GlassDropPlan): GlassDropDeparture | null => {
  if (plan.act === 'settled') {
    return null;
  }

  const act = motionActOf(plan.act);

  if (act === null) {
    return { to: STILL, duration: FADE_SECONDS, wave: null };
  }

  return {
    to: textDepartureOf(act, plan.direction),
    duration: DEPARTURE_SECONDS,
    wave: DEPARTURE_WAVE,
  };
};
