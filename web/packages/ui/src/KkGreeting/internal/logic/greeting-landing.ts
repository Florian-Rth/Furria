import type { FlapRun, FlapSchedule } from './flap-schedule';

const landingOfRun = (run: FlapRun): number => {
  if (run.motion !== 'flap') {
    return run.end;
  }

  return run.flips.at(-1)?.at ?? run.end;
};

export const landingAtOf = (schedule: FlapSchedule): number =>
  Math.max(0, ...schedule.runs.map(landingOfRun));
