import type { MusicSegment } from './music-timeline';
import { BEAT_ROUNDING_SECONDS, beatGridAt, countOfBeat, segmentAt } from './music-timeline';

export const COUNT_IN_BEATS = 4;
const ON_BEAT_SECONDS = BEAT_ROUNDING_SECONDS;

export interface CountInClick {
  offsetSeconds: number;
  count: number;
}

export interface CountIn {
  leadSeconds: number;
  clicks: CountInClick[];
}

export const countInOf = (
  segments: readonly MusicSegment[],
  startSeconds: number,
  rate: number,
  beats: number,
): CountIn | null => {
  const segment = segmentAt(segments, startSeconds);

  if (segment === null || beats <= 0) {
    return null;
  }

  const sourceSeconds = segment.sourceStart + (startSeconds - segment.timelineStart);
  const grid = beatGridAt(segment, sourceSeconds);

  if (grid === null) {
    return null;
  }

  const { firstBeatSeconds, beatSeconds: beat } = grid;
  const landingBeat = Math.ceil((sourceSeconds - ON_BEAT_SECONDS - firstBeatSeconds) / beat);
  const firstClickBeat = landingBeat - beats;
  const firstClickSeconds = firstBeatSeconds + firstClickBeat * beat;
  const clicks = Array.from({ length: beats }, (_, index) => ({
    offsetSeconds: (index * beat) / rate,
    count: countOfBeat(firstClickBeat + index),
  }));

  return { leadSeconds: (sourceSeconds - firstClickSeconds) / rate, clicks };
};

export const countInAt = (countIn: CountIn, elapsedSeconds: number): number | null => {
  if (elapsedSeconds >= countIn.leadSeconds) {
    return null;
  }

  return (
    countIn.clicks.findLast((click) => click.offsetSeconds <= elapsedSeconds + ON_BEAT_SECONDS)
      ?.count ?? null
  );
};
