import type { FlapCue, FlapRun, FlapSchedule } from './flap-schedule';

export type GreetingPhase = 'waiting' | 'playing' | 'settled';

export type GreetingStance = 'resting' | 'moving' | 'veiled';

export interface GreetingCue {
  at: number;
  duration: number;
  stance: GreetingStance;
}

const NEVER = Number.POSITIVE_INFINITY;

export const SHOWN_CUE: GreetingCue = { at: 0, duration: 0, stance: 'resting' };
const HIDDEN: GreetingCue = { at: NEVER, duration: 0, stance: 'moving' };
const VEILED: GreetingCue = { at: 0, duration: 0, stance: 'veiled' };

const enteringAt = (at: number, duration: number): GreetingCue => ({
  at,
  duration,
  stance: 'moving',
});

export const cueShareAt = (cue: GreetingCue, clock: number): number => {
  if (cue.duration === 0) {
    return clock >= cue.at ? 1 : 0;
  }

  return Math.min(Math.max((clock - cue.at) / cue.duration, 0), 1);
};

const boundCueOf = (bound: FlapRun | undefined, phase: GreetingPhase): GreetingCue => {
  if (bound === undefined || phase === 'settled') {
    return SHOWN_CUE;
  }

  return phase === 'waiting' ? VEILED : enteringAt(bound.end, 0);
};

export const inkCueOf = (
  cell: number,
  schedule: FlapSchedule,
  phase: GreetingPhase,
  boundTo: number | null = null,
): GreetingCue => {
  const run = schedule.runs.find((candidate) => candidate.cell === cell);

  if (run === undefined) {
    return boundCueOf(
      schedule.runs.find((candidate) => boundTo !== null && candidate.cell === boundTo),
      phase,
    );
  }
  if (phase === 'settled') {
    return SHOWN_CUE;
  }
  if (phase === 'waiting') {
    return VEILED;
  }
  return HIDDEN;
};

export const lineCueOf = (line: FlapCue | null, phase: GreetingPhase): GreetingCue => {
  if (phase === 'settled') {
    return SHOWN_CUE;
  }
  if (phase === 'waiting') {
    return HIDDEN;
  }

  return line === null ? SHOWN_CUE : enteringAt(line.at, line.duration);
};
