import { describe, expect, it } from 'vitest';
import type { KkGlobeRung } from './globe-ladder';
import { climbLadder, KK_LADDER_START } from './globe-ladder';

const climb = (moments: readonly number[]): KkGlobeRung[] => {
  let ladder = KK_LADDER_START;
  return moments.map((at) => {
    const rung = climbLadder(ladder, at);
    ladder = rung.ladder;
    return rung;
  });
};

const pick = (rungs: readonly KkGlobeRung[]): [number, boolean][] =>
  rungs.map((rung) => [rung.add, rung.toss]);

describe('climbLadder', () => {
  it.each([
    {
      name: 'a few small handfuls, then the big pour, then toss and top-ups',
      moments: [0, 2000, 4000, 6000, 8000, 10_000, 12_000],
      rungs: [
        [5, false],
        [8, false],
        [12, false],
        [16, false],
        [140, false],
        [10, true],
        [10, true],
      ],
    },
    {
      name: 'a long pause starts a new session',
      moments: [0, 2000, 30_000, 32_000],
      rungs: [
        [5, false],
        [8, false],
        [5, false],
        [8, false],
      ],
    },
    {
      name: 'pauses inside the session window keep climbing',
      moments: [0, 19_000, 38_000],
      rungs: [
        [5, false],
        [8, false],
        [12, false],
      ],
    },
  ])('$name', ({ moments, rungs }) => {
    expect(pick(climb(moments))).toEqual(rungs);
  });
});
