import type { FlapRun, FlapSchedule } from './flap-schedule';

const landingOfRun = (run: FlapRun): number => run.flips.at(-1)?.at ?? run.end;

export const landingAtOf = (schedule: FlapSchedule): number =>
  Math.max(0, ...schedule.runs.map(landingOfRun));
