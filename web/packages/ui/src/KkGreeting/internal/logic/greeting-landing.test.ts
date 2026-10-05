import { describe, expect, it } from 'vitest';
import type { FlapRun, FlapSchedule } from './flap-schedule';
import { landingAtOf } from './greeting-landing';

const scheduleOf = (runs: FlapRun[]): FlapSchedule => ({
  runs,
  tone: 'ink',
  line: null,
  burstAt: null,
  duration: Math.max(0, ...runs.map((run) => run.end)),
});

describe('landingAtOf', () => {
  it('lands when the last cell starts its final fall, not when its rebound ends', () => {
    const schedule = scheduleOf([
      {
        cell: 0,
        start: 0,
        end: 450,
        faces: [],
        flips: [
          { kind: 'face', at: 0, duration: 110 },
          { kind: 'final', at: 220, duration: 230 },
        ],
      },
      {
        cell: 1,
        start: 55,
        end: 505,
        faces: [],
        flips: [
          { kind: 'face', at: 55, duration: 110 },
          { kind: 'final', at: 275, duration: 230 },
        ],
      },
    ]);

    expect(landingAtOf(schedule)).toBe(275);
  });

  it.each<[string, FlapRun[], number]>([['an empty board', [], 0]])(
    'waits for %s to finish',
    (_, runs, landing) => {
      expect(landingAtOf(scheduleOf(runs))).toBe(landing);
    },
  );
});
