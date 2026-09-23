export interface SwayState {
  angle: number;
  velocity: number;
}

export interface SwayKick {
  at: number;
  velocity: number;
}

export const SWAY_UPRIGHT: SwayState = { angle: 0, velocity: 0 };

const SWING_HERTZ = 1.9;
const SWING_DAMPING = 0.2;
const SWING_OMEGA = 2 * Math.PI * SWING_HERTZ;
const LONGEST_STEP_SECONDS = 1 / 30;
const WIDEST_ANGLE = 16;
const WAVE_CYCLES = 1.5;
const WAVE_SPREAD = 0.38;
const RESTING_ANGLE = 0.12;
const RESTING_VELOCITY = 1.5;

const clampAngle = (angle: number): number =>
  Math.min(Math.max(angle, -WIDEST_ANGLE), WIDEST_ANGLE);

export const swayStep = (state: SwayState, target: number, seconds: number): SwayState => {
  const step = Math.min(Math.max(seconds, 0), LONGEST_STEP_SECONDS);
  const pull = -SWING_OMEGA * SWING_OMEGA * (state.angle - target);
  const drag = -2 * SWING_DAMPING * SWING_OMEGA * state.velocity;
  const velocity = state.velocity + (pull + drag) * step;

  return { angle: clampAngle(state.angle + velocity * step), velocity };
};

export const swayResting = (state: SwayState): boolean =>
  Math.abs(state.angle) < RESTING_ANGLE && Math.abs(state.velocity) < RESTING_VELOCITY;

export const waveTargetAt = (progress: number, index: number, reach: number): number => {
  if (progress <= 0 || progress >= 1) {
    return 0;
  }

  const envelope = Math.sin(Math.PI * progress);

  return reach * envelope * Math.sin(2 * Math.PI * WAVE_CYCLES * progress - WAVE_SPREAD * index);
};

export const kickVelocityOf = (tilt: number): number => tilt * SWING_OMEGA;

export const kicksOf = (count: number, now: number, lag: number, velocity: number): SwayKick[] =>
  Array.from({ length: count }, (_, index) => ({ at: now + index * lag, velocity }));

export const applyDueKick = (
  state: SwayState,
  kick: SwayKick | null,
  now: number,
): { state: SwayState; kick: SwayKick | null } => {
  if (kick === null || kick.at > now) {
    return { state, kick };
  }

  return { state: { angle: state.angle, velocity: state.velocity + kick.velocity }, kick: null };
};
