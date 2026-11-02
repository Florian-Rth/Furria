import type { MusicSegment, TimelineRange } from '../models/music-timeline';

const MIN_PIECE_SECONDS = 0.001;

export interface MixPiece {
  mediaItemId: number;
  sourceOffset: number;
  duration: number;
  timelineStart: number;
}

export interface StretchSlice {
  mediaItemId: number | null;
  sourceSample: number;
  samples: number;
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

  const upcoming = runs.find((candidate) => candidate.contextStart > contextSeconds);

  if (upcoming !== undefined) {
    return upcoming.from;
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

export const stretchSlicesOf = (
  segments: readonly MusicSegment[],
  length: number,
  sampleRate: number,
): StretchSlice[] => {
  const slices: StretchSlice[] = [];
  let cursor = 0;
  const pieces = mixPiecesOf(
    segments.filter((segment) => segment.audible),
    0,
    length,
  ).sort((left, right) => left.timelineStart - right.timelineStart);

  for (const piece of pieces) {
    const start = Math.round(piece.timelineStart * sampleRate);
    const end = Math.round((piece.timelineStart + piece.duration) * sampleRate);

    if (start > cursor) {
      slices.push({ mediaItemId: null, sourceSample: 0, samples: start - cursor });
    }

    const from = Math.max(start, cursor);

    if (end > from) {
      slices.push({
        mediaItemId: piece.mediaItemId,
        sourceSample: Math.round(piece.sourceOffset * sampleRate) + (from - start),
        samples: end - from,
      });
    }

    cursor = Math.max(cursor, end);
  }

  return slices;
};
