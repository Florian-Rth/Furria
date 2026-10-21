export interface KkShakeSample {
  readonly at: number;
  readonly force: number;
}

export interface KkShakeState {
  readonly peaks: readonly number[];
  readonly armed: boolean;
  readonly quietUntil: number;
}

export interface KkShakeReading {
  readonly state: KkShakeState;
  readonly shaken: boolean;
}

export interface KkAxes {
  readonly x: number | null;
  readonly y: number | null;
  readonly z: number | null;
}

const EARTH = 9.81;
const PEAK_FORCE = 13;
const RELEASE_FORCE = 7;
const WINDOW_MS = 800;
const PEAKS_TO_SHAKE = 2;
const COOLDOWN_MS = 600;
const SIMULATED_PEAKS = 2;
const SIMULATED_BEAT_MS = 180;
const SIMULATED_PEAK_FORCE = 22;
const SIMULATED_LOW_FORCE = 2;

export const KK_SHAKE_REST: KkShakeState = { peaks: [], armed: true, quietUntil: 0 };

export const senseShake = (state: KkShakeState, sample: KkShakeSample): KkShakeReading => {
  const armed = state.armed || sample.force < RELEASE_FORCE;
  if (sample.at < state.quietUntil || !armed || sample.force < PEAK_FORCE) {
    return { state: armed === state.armed ? state : { ...state, armed }, shaken: false };
  }
  const peaks = [...state.peaks.filter((peak) => sample.at - peak <= WINDOW_MS), sample.at];
  if (peaks.length >= PEAKS_TO_SHAKE) {
    return {
      state: { peaks: [], armed: false, quietUntil: sample.at + COOLDOWN_MS },
      shaken: true,
    };
  }
  return { state: { peaks, armed: false, quietUntil: state.quietUntil }, shaken: false };
};

const lengthOf = (axes: KkAxes): number => Math.hypot(axes.x ?? 0, axes.y ?? 0, axes.z ?? 0);

const hasReading = (axes: KkAxes | null): axes is KkAxes =>
  axes !== null && (axes.x !== null || axes.y !== null || axes.z !== null);

export const shakeForceOf = (linear: KkAxes | null, withGravity: KkAxes | null): number => {
  if (hasReading(linear)) {
    return lengthOf(linear);
  }
  if (hasReading(withGravity)) {
    return Math.abs(lengthOf(withGravity) - EARTH);
  }
  return 0;
};

export const simulateShake = (from: number): KkShakeSample[] =>
  Array.from({ length: SIMULATED_PEAKS * 2 }, (_, index) => ({
    at: from + index * (SIMULATED_BEAT_MS / 2),
    force: index % 2 === 0 ? SIMULATED_PEAK_FORCE : SIMULATED_LOW_FORCE,
  }));
