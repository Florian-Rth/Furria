import type { Studio, StudioPart, StudioSong, StudioStep } from './studio-schemas';

const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;
export const EDGE_TOLERANCE_SECONDS = 1e-6;
export const COUNT_EDGE_SECONDS = 1e-3;
export const BEAT_ROUNDING_SECONDS = 0.01;

export interface BeatSection {
  sourceStart: number;
  sourceEnd: number;
  firstBeatSeconds: number;
  tempoBpm: number;
}

export interface MusicSegment {
  songId: number | null;
  mediaItemId: number;
  audioUrl: string;
  peaksUrl: string;
  audible: boolean;
  sourceStart: number;
  sourceEnd: number;
  timelineStart: number;
  timelineEnd: number;
  beats: BeatSection[];
}

export interface BeatGrid {
  firstBeatSeconds: number;
  beatSeconds: number;
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

type SegmentCut = Omit<MusicSegment, 'timelineStart' | 'timelineEnd'>;

const placeCuts = (cuts: readonly SegmentCut[]): MusicSegment[] => {
  let timelineStart = 0;

  return cuts.map((cut) => {
    const timelineEnd = timelineStart + (cut.sourceEnd - cut.sourceStart);
    const segment = { ...cut, timelineStart, timelineEnd };
    timelineStart = timelineEnd;

    return segment;
  });
};

const songSectionsOf = (song: StudioSong): BeatSection[] =>
  song.firstBeatSeconds === null ||
  song.tempoBpm === null ||
  song.tempoBpm <= 0 ||
  song.endSeconds <= song.startSeconds
    ? []
    : [
        {
          sourceStart: song.startSeconds,
          sourceEnd: song.endSeconds,
          firstBeatSeconds: song.firstBeatSeconds,
          tempoBpm: song.tempoBpm,
        },
      ];

const songCutOf = (song: StudioSong): SegmentCut => ({
  songId: song.songId,
  mediaItemId: song.mediaItemId,
  audioUrl: song.urls.normalised,
  peaksUrl: song.urls.peaks,
  audible: song.state === 'ready',
  sourceStart: song.startSeconds,
  sourceEnd: song.endSeconds,
  beats: songSectionsOf(song),
});

export const musicSegmentsOf = (studio: Studio): MusicSegment[] =>
  placeCuts([...studio.songs].sort((left, right) => left.position - right.position).map(songCutOf));

export const canPractise = (studio: Studio | null): boolean =>
  studio !== null && musicSegmentsOf(studio).some((segment) => segment.audible);

export const musicLengthOf = (segments: readonly MusicSegment[]): number =>
  segments.at(-1)?.timelineEnd ?? 0;

export const segmentKeyOf = (segment: MusicSegment): string =>
  segment.songId === null
    ? `${segment.mediaItemId}@${segment.sourceStart}`
    : `song-${segment.songId}`;

export const segmentAt = (
  segments: readonly MusicSegment[],
  seconds: number,
): MusicSegment | null =>
  segments.find((segment) => seconds >= segment.timelineStart && seconds < segment.timelineEnd) ??
  null;

const startsIn = (segment: MusicSegment, anchor: MusicAnchor): boolean =>
  segment.mediaItemId === anchor.sourceMediaItemId &&
  anchor.seconds >= segment.sourceStart - EDGE_TOLERANCE_SECONDS;

export const timelineSecondsOf = (
  segments: readonly MusicSegment[],
  anchor: MusicAnchor,
): number | null => {
  const segment =
    segments.find(
      (candidate) => startsIn(candidate, anchor) && anchor.seconds < candidate.sourceEnd,
    ) ??
    segments.findLast(
      (candidate) =>
        startsIn(candidate, anchor) &&
        anchor.seconds <= candidate.sourceEnd + EDGE_TOLERANCE_SECONDS,
    );

  return segment === undefined
    ? null
    : segment.timelineStart + Math.max(0, anchor.seconds - segment.sourceStart);
};

const gridOf = (section: BeatSection): BeatGrid => ({
  firstBeatSeconds: section.firstBeatSeconds,
  beatSeconds: SECONDS_PER_MINUTE / section.tempoBpm,
});

export const beatGridAt = (segment: MusicSegment, sourceSeconds: number): BeatGrid | null => {
  const at = sourceSeconds + BEAT_ROUNDING_SECONDS;
  const section = segment.beats.find(
    (candidate) => at >= candidate.sourceStart && at < candidate.sourceEnd,
  );

  return section === undefined ? null : gridOf(section);
};

const beatIndexAt = (segment: MusicSegment, sourceSeconds: number): number | null => {
  const grid = beatGridAt(segment, sourceSeconds);

  return grid === null
    ? null
    : Math.floor(
        (sourceSeconds + BEAT_ROUNDING_SECONDS - grid.firstBeatSeconds) / grid.beatSeconds,
      );
};

export const countOfBeat = (beatIndex: number): number =>
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

const countMarksInSection = (segment: MusicSegment, section: BeatSection): CountMark[] => {
  const { firstBeatSeconds: firstBeat, beatSeconds: beat } = gridOf(section);
  const start = Math.max(segment.sourceStart, section.sourceStart);
  const end = Math.min(segment.sourceEnd, section.sourceEnd);
  const firstIndex = Math.max(0, Math.ceil((start - firstBeat) / beat - EDGE_TOLERANCE_SECONDS));
  const marks: CountMark[] = [];

  for (
    let index = firstIndex;
    firstBeat + index * beat < end - EDGE_TOLERANCE_SECONDS;
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
  segments.flatMap((segment) =>
    segment.beats.flatMap((section) => countMarksInSection(segment, section)),
  );

export interface TimedStudioStep extends StudioStep {
  startSeconds: number;
  endSeconds: number;
}

export const isStepOnTimeline = (step: StudioStep): step is TimedStudioStep =>
  step.startSeconds !== null && step.endSeconds !== null && step.endSeconds > step.startSeconds;

export const stepRangeOf = (step: StudioStep): TimelineRange | null =>
  isStepOnTimeline(step) ? { start: step.startSeconds, end: step.endSeconds } : null;

export type OffTimelinePlacement = Exclude<StudioStep['placement'], 'onTimeline'>;

export const offTimelinePlacementOf = (step: StudioStep): OffTimelinePlacement | null => {
  if (isStepOnTimeline(step)) {
    return null;
  }
  if (step.placement !== 'onTimeline') {
    return step.placement;
  }

  return step.endPlacement === 'onTimeline' ? 'cutAway' : step.endPlacement;
};

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

export const neighbourCountOf = (
  marks: readonly CountMark[],
  seconds: number,
  direction: 1 | -1,
): number | null => {
  const next =
    direction === 1
      ? marks.find((mark) => mark.seconds > seconds + COUNT_EDGE_SECONDS)
      : marks.findLast((mark) => mark.seconds < seconds - COUNT_EDGE_SECONDS);

  return next?.seconds ?? null;
};
