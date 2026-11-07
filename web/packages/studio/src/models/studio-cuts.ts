import type { SongPiece } from '@furria/studio/studio-schemas';

export const MIN_CUT_SECONDS = 0.5;
export const EARLIER_CUT_NUDGES: readonly number[] = [-0.1, -0.01];
export const LATER_CUT_NUDGES: readonly number[] = [0.01, 0.1];

const CUT_GRAIN = 1000;
const CUT_TOLERANCE_SECONDS = 1e-6;
const PLAYHEAD_TOLERANCE_SECONDS = 0.5 / CUT_GRAIN;

export type CutEdge = 'start' | 'end';

export type CutSpan = SongPiece;

export const roundedCutOf = (seconds: number): number =>
  Math.round(seconds * CUT_GRAIN) / CUT_GRAIN;

const replacedPiecesOf = (pieces: readonly CutSpan[], index: number, piece: CutSpan): CutSpan[] =>
  pieces.map((candidate, at) => (at === index ? piece : candidate));

export const pieceIndexAt = (pieces: readonly CutSpan[], seconds: number): number =>
  pieces.findIndex((piece) => seconds >= piece.startSeconds && seconds < piece.endSeconds);

export const trimmedPiecesOf = (
  pieces: readonly CutSpan[],
  index: number,
  edge: CutEdge,
  at: number,
  limit: number | null,
): CutSpan[] | null => {
  const piece = pieces[index];
  if (piece === undefined) {
    return null;
  }

  const seconds = roundedCutOf(at);
  if (edge === 'start') {
    const lowest = pieces[index - 1]?.endSeconds ?? 0;
    const highest = piece.endSeconds - MIN_CUT_SECONDS;

    return seconds < lowest - CUT_TOLERANCE_SECONDS || seconds > highest + CUT_TOLERANCE_SECONDS
      ? null
      : replacedPiecesOf(pieces, index, { startSeconds: seconds, endSeconds: piece.endSeconds });
  }

  const lowest = piece.startSeconds + MIN_CUT_SECONDS;
  const highest = pieces[index + 1]?.startSeconds ?? limit ?? Number.POSITIVE_INFINITY;

  return seconds < lowest - CUT_TOLERANCE_SECONDS || seconds > highest + CUT_TOLERANCE_SECONDS
    ? null
    : replacedPiecesOf(pieces, index, { startSeconds: piece.startSeconds, endSeconds: seconds });
};

export const nudgedPiecesOf = (
  pieces: readonly CutSpan[],
  index: number,
  edge: CutEdge,
  delta: number,
  limit: number | null,
): CutSpan[] | null => {
  const piece = pieces[index];
  if (piece === undefined) {
    return null;
  }

  const from = edge === 'start' ? piece.startSeconds : piece.endSeconds;

  return trimmedPiecesOf(pieces, index, edge, from + delta, limit);
};

export const splitPiecesOf = (
  pieces: readonly CutSpan[],
  index: number,
  at: number,
): CutSpan[] | null => {
  const piece = pieces[index];
  if (piece === undefined) {
    return null;
  }

  const seconds = roundedCutOf(at);
  const fits =
    seconds - piece.startSeconds >= MIN_CUT_SECONDS - CUT_TOLERANCE_SECONDS &&
    piece.endSeconds - seconds >= MIN_CUT_SECONDS - CUT_TOLERANCE_SECONDS;

  return fits
    ? [
        ...pieces.slice(0, index),
        { startSeconds: piece.startSeconds, endSeconds: seconds },
        { startSeconds: seconds, endSeconds: piece.endSeconds },
        ...pieces.slice(index + 1),
      ]
    : null;
};

export const removedPiecesOf = (pieces: readonly CutSpan[], index: number): CutSpan[] | null =>
  pieces.length <= 1 || pieces[index] === undefined ? null : pieces.filter((_, at) => at !== index);

export const shiftedPositionOf = (position: number, at: number, removed: number): number =>
  position < at ? position : Math.max(at, position - removed);

export interface CutReach {
  startHere: boolean;
  split: boolean;
  endHere: boolean;
}

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

export const cutReachOf = (
  pieces: readonly CutSpan[],
  index: number,
  at: number | null,
  limit: number | null,
): CutReach =>
  at === null
    ? { startHere: false, split: false, endHere: false }
    : {
        startHere: trimmedPiecesOf(pieces, index, 'start', at, limit) !== null,
        split: splitPiecesOf(pieces, index, at) !== null,
        endHere: trimmedPiecesOf(pieces, index, 'end', at, limit) !== null,
      };
