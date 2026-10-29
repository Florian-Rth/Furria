import type { MusicSegment, TimelineRange } from './music-timeline';

const MIN_PIECE_SECONDS = 0.001;
const SEMITONES_PER_OCTAVE = 12;

export interface MixPiece {
  mediaItemId: number;
  sourceOffset: number;
  duration: number;
  timelineStart: number;
}

export interface MixRun {
  contextStart: number;
  from: number;
  to: number;
  rate: number;
}

export const mixPiecesOf = (
  segments: readonly MusicSegment[],
  from: number,
  to: number,
): MixPiece[] =>
  segments
    .map((segment) => {
      const start = Math.max(from, segment.timelineStart);
      const end = Math.min(to, segment.timelineEnd);

      return {
        mediaItemId: segment.mediaItemId,
        sourceOffset: segment.sourceStart + (start - segment.timelineStart),
        duration: end - start,
        timelineStart: start,
      };
    })
    .filter((piece) => piece.duration > MIN_PIECE_SECONDS);

export const runEndOf = (run: MixRun): number => run.contextStart + (run.to - run.from) / run.rate;

export const positionInRuns = (runs: readonly MixRun[], contextSeconds: number): number | null => {
  const run = runs.find(
    (candidate) => contextSeconds >= candidate.contextStart && contextSeconds < runEndOf(candidate),
  );

  if (run !== undefined) {
    return run.from + (contextSeconds - run.contextStart) * run.rate;
  }

  const finished = runs.filter((candidate) => runEndOf(candidate) <= contextSeconds).at(-1);

  return finished === undefined ? null : finished.to;
};

export const playRangeOf = (
  from: number,
  loop: TimelineRange | null,
  length: number,
): TimelineRange => {
  if (loop === null) {
    return { start: from, end: length };
  }

  const insideLoop = from >= loop.start && from < loop.end;

  return { start: insideLoop ? from : loop.start, end: loop.end };
};

export const pitchCorrectionOf = (rate: number): number =>
  rate <= 0 || rate >= 1 ? 0 : -SEMITONES_PER_OCTAVE * Math.log2(rate);
