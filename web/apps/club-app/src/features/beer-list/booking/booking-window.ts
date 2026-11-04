export const BEER_COUNTS: readonly number[] = [1, 2, 3];

export const UNDO_WINDOW_MS = 10_000;

export const undoRemainingMsOf = (endsAt: number, now: number): number =>
  Math.min(UNDO_WINDOW_MS, Math.max(0, endsAt - now));
