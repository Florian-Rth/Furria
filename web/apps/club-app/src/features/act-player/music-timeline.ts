import type {
  Studio,
  StudioFinalTrack,
  StudioPart,
  StudioSong,
  StudioStep,
} from '@/features/acts/schemas';

const SECONDS_PER_MINUTE = 60;
const COUNTS_PER_EIGHT = 8;
export const EDGE_TOLERANCE_SECONDS = 1e-6;
export const BEAT_ROUNDING_SECONDS = 0.01;

export interface BeatSection {
  sourceStart: number;
  sourceEnd: number;
  firstBeatSeconds: number;
  tempoBpm: number;
}

export interface MusicSegment {
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

interface SegmentCut {
  mediaItemId: number;
  audioUrl: string;
  peaksUrl: string;
  audible: boolean;
  sourceStart: number;
  sourceEnd: number;
  beats: BeatSection[];
}

interface Placement {
  offsetSeconds: number;
  stretch: number;
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

const knownSectionsOf = (
  firstBeatSeconds: number | null,
  tempoBpm: number | null,
  sourceStart: number,
  sourceEnd: number,
): BeatSection[] =>
  firstBeatSeconds === null || tempoBpm === null || tempoBpm <= 0 || sourceEnd <= sourceStart
    ? []
    : [{ sourceStart, sourceEnd, firstBeatSeconds, tempoBpm }];

const songSectionsOf = (song: StudioSong): BeatSection[] =>
  knownSectionsOf(song.firstBeatSeconds, song.tempoBpm, song.startSeconds, song.endSeconds);

const placedSectionOf = (section: BeatSection, placement: Placement): BeatSection => ({
  sourceStart: placement.offsetSeconds + section.sourceStart * placement.stretch,
  sourceEnd: placement.offsetSeconds + section.sourceEnd * placement.stretch,
  firstBeatSeconds: placement.offsetSeconds + section.firstBeatSeconds * placement.stretch,
  tempoBpm: section.tempoBpm / placement.stretch,
});

const clippedSectionsOf = (sections: readonly BeatSection[], length: number): BeatSection[] => {
  const ordered = [...sections].sort((left, right) => left.sourceStart - right.sourceStart);

  return ordered
    .map((section, index) => ({
      ...section,
      sourceStart: Math.max(0, section.sourceStart),
      sourceEnd: Math.min(length, section.sourceEnd, ordered[index + 1]?.sourceStart ?? length),
    }))
    .filter((section) => section.sourceEnd > section.sourceStart);
};

const filledSectionsOf = (
  sections: readonly BeatSection[],
  track: StudioFinalTrack,
  length: number,
): BeatSection[] => {
  const gapsOf = (start: number, end: number): BeatSection[] =>
    knownSectionsOf(track.firstBeatSeconds, track.tempoBpm, start, end);
  const filled: BeatSection[] = [];
  let cursor = 0;

  for (const section of sections) {
    filled.push(...gapsOf(cursor, section.sourceStart), section);
    cursor = section.sourceEnd;
  }

  return [...filled, ...gapsOf(cursor, length)];
};

const sourceSectionsOf = (
  studio: Studio,
  mediaItemId: number,
  visited: ReadonlySet<number>,
): BeatSection[] => {
  const song = studio.songs.find((candidate) => candidate.mediaItemId === mediaItemId);
  const track = studio.finalTracks.find((candidate) => candidate.mediaItemId === mediaItemId);

  if (song !== undefined) {
    return songSectionsOf(song);
  }

  return track === undefined || visited.has(mediaItemId)
    ? []
    : finalTrackSectionsOf(studio, track, visited);
};

const finalTrackSectionsOf = (
  studio: Studio,
  track: StudioFinalTrack,
  visited: ReadonlySet<number> = new Set(),
): BeatSection[] => {
  const length = track.durationSeconds ?? 0;
  const inner = new Set([...visited, track.mediaItemId]);
  const placed = track.alignments.flatMap((alignment) =>
    sourceSectionsOf(studio, alignment.sourceMediaItemId, inner).map((section) =>
      placedSectionOf(section, alignment),
    ),
  );

  return filledSectionsOf(clippedSectionsOf(placed, length), track, length);
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
      beats: songSectionsOf(song),
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
      beats: finalTrackSectionsOf(studio, track),
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
