export const MIN_CUT_SECONDS = 0.5;
export const EARLIER_CUT_NUDGES: readonly number[] = [-0.1, -0.01];
export const LATER_CUT_NUDGES: readonly number[] = [0.01, 0.1];

const CUT_GRAIN = 1000;
const CUT_TOLERANCE_SECONDS = 1e-6;
const PLAYHEAD_TOLERANCE_SECONDS = 0.5 / CUT_GRAIN;

export type CutEdge = 'start' | 'end';

export interface CutSpan {
  startSeconds: number;
  endSeconds: number;
}

export interface CutRoom {
  lowest: number;
  highest: number;
}

export interface CutReach {
  startHere: boolean;
  split: boolean;
  endHere: boolean;
}

const NO_REACH: CutReach = { startHere: false, split: false, endHere: false };

export const roundedCutOf = (seconds: number): number =>
  Math.round(seconds * CUT_GRAIN) / CUT_GRAIN;

const isWithin = (seconds: number, lowest: number, highest: number): boolean =>
  seconds >= lowest - CUT_TOLERANCE_SECONDS && seconds <= highest + CUT_TOLERANCE_SECONDS;

export const cutRoomOf = (
  cut: CutSpan,
  siblings: readonly CutSpan[],
  limit: number | null,
): CutRoom => ({
  lowest: Math.max(
    0,
    ...siblings
      .filter((sibling) => sibling.endSeconds <= cut.startSeconds + CUT_TOLERANCE_SECONDS)
      .map((sibling) => sibling.endSeconds),
  ),
  highest: Math.min(
    limit ?? Number.POSITIVE_INFINITY,
    ...siblings
      .filter((sibling) => sibling.startSeconds >= cut.endSeconds - CUT_TOLERANCE_SECONDS)
      .map((sibling) => sibling.startSeconds),
  ),
});

export const trimmedCutOf = (
  cut: CutSpan,
  edge: CutEdge,
  at: number,
  room: CutRoom,
): CutSpan | null => {
  const seconds = roundedCutOf(at);

  if (edge === 'start') {
    return isWithin(seconds, room.lowest, cut.endSeconds - MIN_CUT_SECONDS)
      ? { startSeconds: seconds, endSeconds: cut.endSeconds }
      : null;
  }

  return isWithin(seconds, cut.startSeconds + MIN_CUT_SECONDS, room.highest)
    ? { startSeconds: cut.startSeconds, endSeconds: seconds }
    : null;
};

export const nudgedCutOf = (
  cut: CutSpan,
  edge: CutEdge,
  delta: number,
  room: CutRoom,
): CutSpan | null =>
  trimmedCutOf(cut, edge, (edge === 'start' ? cut.startSeconds : cut.endSeconds) + delta, room);

export const splitPointOf = (cut: CutSpan, at: number): number | null => {
  const seconds = roundedCutOf(at);

  return isWithin(seconds, cut.startSeconds + MIN_CUT_SECONDS, cut.endSeconds - MIN_CUT_SECONDS)
    ? seconds
    : null;
};

export const shiftedPositionOf = (position: number, at: number, removed: number): number =>
  position < at ? position : Math.max(at, position - removed);

export const playheadInOf = (
  timelineStart: number,
  timelineEnd: number,
  sourceStart: number,
  seconds: number,
): number | null =>
  seconds < timelineStart - PLAYHEAD_TOLERANCE_SECONDS ||
  seconds > timelineEnd + PLAYHEAD_TOLERANCE_SECONDS
    ? null
    : sourceStart + seconds - timelineStart;

export const cutReachOf = (cut: CutSpan | null, at: number | null, room: CutRoom): CutReach =>
  cut === null || at === null
    ? NO_REACH
    : {
        startHere: trimmedCutOf(cut, 'start', at, room) !== null,
        split: splitPointOf(cut, at) !== null,
        endHere: trimmedCutOf(cut, 'end', at, room) !== null,
      };
