export interface RelayClockState {
  elapsed: number;
  last: number | null;
  first: number | null;
}

const WARM_UP = 68;
const WARM_UP_STEP = 34;
const MAX_STEP = 100;
const MILLISECONDS = 1000;
const LATE_FACTOR = 1.6;

export const START_CLOCK: RelayClockState = { elapsed: 0, last: null, first: null };

export const clockStepOf = (state: RelayClockState, now: number): RelayClockState => {
  const cap = state.elapsed < WARM_UP ? WARM_UP_STEP : MAX_STEP;
  const step = state.last === null ? 0 : Math.min(cap, now - state.last);

  return { elapsed: state.elapsed + step, last: now, first: state.first ?? now };
};

export const clockProgressOf = (state: RelayClockState, seconds: number): number => {
  const span = seconds * MILLISECONDS;
  const wall = state.first === null || state.last === null ? 0 : state.last - state.first;
  const overdue = wall >= span * LATE_FACTOR ? 1 : 0;

  return Math.min(1, Math.max(overdue, state.elapsed / span));
};

export const runClock = (
  seconds: number,
  frame: (progress: number) => void,
  finish: () => void,
): (() => void) => {
  let state = START_CLOCK;
  let handle = 0;

  const tick = (now: number): void => {
    state = clockStepOf(state, now);

    const progress = clockProgressOf(state, seconds);

    frame(progress);

    if (progress < 1) {
      handle = window.requestAnimationFrame(tick);
    } else {
      finish();
    }
  };

  handle = window.requestAnimationFrame(tick);

  return () => {
    window.cancelAnimationFrame(handle);
  };
};
