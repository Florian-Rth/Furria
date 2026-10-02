import type { FlapCue, FlapRun, FlapSchedule, KkGreetingPlay } from './flap-schedule';

export type GreetingPhase = 'waiting' | 'playing' | 'settled';

export interface GreetingCue {
  opacity: number;
  y: number;
  delay: number;
  duration: number;
  moving: boolean;
}

const MS_PER_SECOND = 1000;
const LINE_DROP = 4;

export const SHOWN_CUE: GreetingCue = { opacity: 1, y: 0, delay: 0, duration: 0, moving: false };
const HIDDEN: GreetingCue = { opacity: 0, y: 0, delay: 0, duration: 0, moving: true };
const LOWERED: GreetingCue = { opacity: 0, y: LINE_DROP, delay: 0, duration: 0, moving: true };

const enteringAt = (at: number, duration: number): GreetingCue => ({
  opacity: 1,
  y: 0,
  delay: at / MS_PER_SECOND,
  duration: duration / MS_PER_SECOND,
  moving: true,
});

const startsOnItsFace = (run: FlapRun): boolean => {
  if (run.motion === 'fade') {
    return false;
  }

  const first = run.faces[0];
  const last = run.faces.at(-1);

  return first?.kind === 'text' && last?.kind === 'text' && first.text === last.text;
};

const boundCueOf = (bound: FlapRun | undefined, phase: GreetingPhase): GreetingCue => {
  if (bound === undefined || phase === 'settled') {
    return SHOWN_CUE;
  }

  return phase === 'waiting' ? HIDDEN : enteringAt(bound.end, 0);
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
  if (phase === 'waiting' && startsOnItsFace(run)) {
    return SHOWN_CUE;
  }
  if (run.motion === 'fade' && phase === 'playing') {
    return enteringAt(run.start, run.end - run.start);
  }

  return HIDDEN;
};

const ENTERING_PLAYS: ReadonlySet<KkGreetingPlay> = new Set(['full', 'live']);

export const lineCueOf = (
  play: KkGreetingPlay,
  line: FlapCue | null,
  phase: GreetingPhase,
): GreetingCue => {
  if (phase === 'settled' || !ENTERING_PLAYS.has(play)) {
    return SHOWN_CUE;
  }
  if (phase === 'waiting') {
    return LOWERED;
  }

  return line === null ? SHOWN_CUE : enteringAt(line.at, line.duration);
};
