export interface KkGlobeLadder {
  readonly shakes: number;
  readonly lastAt: number;
}

export interface KkGlobeRung {
  readonly ladder: KkGlobeLadder;
  readonly add: number;
  readonly toss: boolean;
}

const RUNGS: readonly number[] = [5, 8, 12, 16, 140];
const TOP_UP = 10;
const SESSION_MS = 20_000;

export const KK_LADDER_START: KkGlobeLadder = { shakes: 0, lastAt: Number.NEGATIVE_INFINITY };

export const climbLadder = (ladder: KkGlobeLadder, at: number): KkGlobeRung => {
  const shakes = at - ladder.lastAt > SESSION_MS ? 1 : ladder.shakes + 1;

  return {
    ladder: { shakes, lastAt: at },
    add: RUNGS[shakes - 1] ?? TOP_UP,
    toss: shakes > RUNGS.length,
  };
};
