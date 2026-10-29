import type { Studio, StudioPart, StudioStep } from '@/features/acts/schemas';

const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;
const EDGE_TOLERANCE_SECONDS = 1e-6;

export interface MusicSegment {
  mediaItemId: number;
  audioUrl: string;
  peaksUrl: string;
  audible: boolean;
  sourceStart: number;
  sourceEnd: number;
  timelineStart: number;
  timelineEnd: number;
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

export interface MusicAnchor {
  sourceMediaItemId: number;
  seconds: number;
}

export interface TimelineRange {
  start: number;
  end: number;
}

export interface CountMark {
  seconds: number;
  count: number;
}

export interface CountAt {
  count: number;
  eight: number;
}

interface SegmentCut {
  mediaItemId: number;
  audioUrl: string;
  peaksUrl: string;
  audible: boolean;
  sourceStart: number;
  sourceEnd: number;
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

const placeCuts = (cuts: readonly SegmentCut[]): MusicSegment[] => {
  let timelineStart = 0;

  return cuts.map((cut) => {
    const timelineEnd = timelineStart + (cut.sourceEnd - cut.sourceStart);
    const segment = { ...cut, timelineStart, timelineEnd };
    timelineStart = timelineEnd;

    return segment;
  });
};

const songCutsOf = (studio: Studio): SegmentCut[] =>
  [...studio.songs]
    .sort((left, right) => left.position - right.position)
    .map((song) => ({
      mediaItemId: song.mediaItemId,
      audioUrl: song.urls.normalised,
      peaksUrl: song.urls.peaks,
      audible: song.state === 'ready',
      sourceStart: song.startSeconds,
      sourceEnd: song.endSeconds,
      firstBeatSeconds: song.firstBeatSeconds,
      tempoBpm: song.tempoBpm,
    }));

const finalTrackCutsOf = (studio: Studio): SegmentCut[] =>
  studio.finalTracks
    .filter((track) => track.adopted)
    .map((track) => ({
      mediaItemId: track.mediaItemId,
      audioUrl: track.urls.normalised,
      peaksUrl: track.urls.peaks,
      audible: track.state === 'ready',
      sourceStart: 0,
      sourceEnd: track.durationSeconds ?? 0,
      firstBeatSeconds: null,
      tempoBpm: null,
    }));

export const musicSegmentsOf = (studio: Studio): MusicSegment[] =>
  placeCuts(studio.music.source === 'finalTrack' ? finalTrackCutsOf(studio) : songCutsOf(studio));

export const musicLengthOf = (segments: readonly MusicSegment[]): number =>
  segments.at(-1)?.timelineEnd ?? 0;

export const segmentAt = (
  segments: readonly MusicSegment[],
  seconds: number,
): MusicSegment | null =>
  segments.find((segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd) ??
  null;

export const timelineSecondsOf = (
  segments: readonly MusicSegment[],
  anchor: MusicAnchor,
): number | null => {
  const segment = segments.find(
    (candidate) =>
      candidate.mediaItemId === anchor.sourceMediaItemId &&
      anchor.seconds >= candidate.sourceStart - EDGE_TOLERANCE_SECONDS &&
      anchor.seconds <= candidate.sourceEnd + EDGE_TOLERANCE_SECONDS,
  );

  return segment === undefined
    ? null
    : segment.timelineStart + Math.max(0, anchor.seconds - segment.sourceStart);
};

const beatSecondsOf = (segment: MusicSegment): number | null =>
  segment.tempoBpm === null || segment.tempoBpm <= 0 ? null : SECONDS_PER_MINUTE / segment.tempoBpm;

const beatIndexAt = (segment: MusicSegment, sourceSeconds: number): number | null => {
  const beat = beatSecondsOf(segment);

  if (beat === null || segment.firstBeatSeconds === null) {
    return null;
  }

  return Math.floor((sourceSeconds - segment.firstBeatSeconds) / beat + EDGE_TOLERANCE_SECONDS);
};

const countOfBeat = (beatIndex: number): number =>
  (((beatIndex % COUNTS_PER_EIGHT) + COUNTS_PER_EIGHT) % COUNTS_PER_EIGHT) + 1;

export const countAt = (segments: readonly MusicSegment[], seconds: number): CountAt | null => {
  const segment = segmentAt(segments, seconds);

  if (segment === null) {
    return null;
  }

  const beatIndex = beatIndexAt(segment, segment.sourceStart + (seconds - segment.timelineStart));

  if (beatIndex === null || beatIndex < 0) {
    return null;
  }

  return { count: countOfBeat(beatIndex), eight: Math.floor(beatIndex / COUNTS_PER_EIGHT) };
};

const countMarksIn = (segment: MusicSegment): CountMark[] => {
  const beat = beatSecondsOf(segment);
  const firstBeat = segment.firstBeatSeconds;

  if (beat === null || firstBeat === null) {
    return [];
  }

  const firstIndex = Math.max(
    0,
    Math.ceil((segment.sourceStart - firstBeat) / beat - EDGE_TOLERANCE_SECONDS),
  );
  const marks: CountMark[] = [];

  for (
    let index = firstIndex;
    firstBeat + index * beat < segment.sourceEnd - EDGE_TOLERANCE_SECONDS;
    index += 1
  ) {
    marks.push({
      seconds: segment.timelineStart + (firstBeat + index * beat - segment.sourceStart),
      count: countOfBeat(index),
    });
  }

  return marks;
};

export const countMarksOf = (segments: readonly MusicSegment[]): CountMark[] =>
  segments.flatMap(countMarksIn);

export const stepRangeOf = (step: StudioStep): TimelineRange | null =>
  step.startSeconds === null || step.endSeconds === null
    ? null
    : { start: step.startSeconds, end: step.endSeconds };

export const partOfStep = (parts: readonly StudioPart[], stepId: number): StudioPart | null =>
  parts.find((part) => part.stepIds.includes(stepId)) ?? null;

export const partRangeOf = (
  part: StudioPart,
  steps: readonly StudioStep[],
): TimelineRange | null => {
  const ranges = steps
    .filter((step) => part.stepIds.includes(step.stepId))
    .map(stepRangeOf)
    .filter((range) => range !== null);

  if (ranges.length === 0) {
    return null;
  }

  return {
    start: Math.min(...ranges.map((range) => range.start)),
    end: Math.max(...ranges.map((range) => range.end)),
  };
};
