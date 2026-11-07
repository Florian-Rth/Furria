import type { MusicAnchor, MusicSegment } from '@furria/studio/music-timeline';
import { EDGE_TOLERANCE_SECONDS, pieceAlignmentOf } from '@furria/studio/music-timeline';
import { finalTitleOf, songNameOf } from '@furria/studio/studio-copy';
import { anchorAt } from '@furria/studio/studio-formation';
import type {
  Studio,
  StudioFinalTrack,
  StudioStep,
  StudioVideo,
} from '@furria/studio/studio-schemas';

const OFFSET_GRAIN = 1000;

export interface FinalPlacement {
  fromSeconds: number;
  offsetSeconds: number;
  stretch: number;
}

export type FinalPlacements = Readonly<Record<number, readonly FinalPlacement[]>>;

export const UNSTRETCHED = 1;

export interface FinalOffsetInput extends FinalPlacement {
  finalTrackId: number;
  sourceMediaItemId: number;
}

export interface FinalBeatInput {
  finalTrackId: number;
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

export interface FinalPlace {
  segment: MusicSegment;
  start: number | null;
  end: number | null;
}

interface FinalSpan {
  placements: FinalPlacements;
  segments: readonly MusicSegment[];
  length: number;
}

interface FinalMapping extends FinalSpan {
  mediaItemId: number;
}

export const adoptedFinalTrackOf = (studio: Studio): StudioFinalTrack | null =>
  studio.finalTracks.find((track) => track.adopted) ?? null;

export const pendingFinalTrackOf = (studio: Studio): StudioFinalTrack | null => {
  const adoptedVersion = adoptedFinalTrackOf(studio)?.version ?? 0;

  return (
    studio.finalTracks
      .filter((track) => !track.adopted && track.version > adoptedVersion)
      .sort((left, right) => right.version - left.version)[0] ?? null
  );
};

export const finalPlacementsOf = (
  track: StudioFinalTrack,
  segments: readonly MusicSegment[],
): FinalPlacements => {
  const sources = new Set(segments.map((segment) => segment.mediaItemId));

  return Object.fromEntries(
    [...new Set(track.alignments.map((alignment) => alignment.sourceMediaItemId))]
      .filter((sourceMediaItemId) => sources.has(sourceMediaItemId))
      .map((sourceMediaItemId) => [
        sourceMediaItemId,
        track.alignments
          .filter((alignment) => alignment.sourceMediaItemId === sourceMediaItemId)
          .map(({ fromSeconds, offsetSeconds, stretch }) => ({
            fromSeconds,
            offsetSeconds,
            stretch,
          }))
          .sort((left, right) => left.fromSeconds - right.fromSeconds),
      ]),
  );
};

export const segmentPlacementOf = (
  placements: FinalPlacements,
  segment: MusicSegment,
): FinalPlacement | null =>
  pieceAlignmentOf(placements[segment.mediaItemId] ?? [], segment.sourceEnd);

const holdsAnchor = (segment: MusicSegment, anchor: MusicAnchor, closed: boolean): boolean =>
  segment.mediaItemId === anchor.sourceMediaItemId &&
  anchor.seconds >= segment.sourceStart &&
  (closed ? anchor.seconds <= segment.sourceEnd : anchor.seconds < segment.sourceEnd);

export const anchorPlacementOf = (
  placements: FinalPlacements,
  segments: readonly MusicSegment[],
  anchor: MusicAnchor,
): FinalPlacement | null => {
  const holder =
    segments.find((segment) => holdsAnchor(segment, anchor, false)) ??
    segments.find((segment) => holdsAnchor(segment, anchor, true));

  if (holder !== undefined) {
    return segmentPlacementOf(placements, holder);
  }

  const entries = placements[anchor.sourceMediaItemId] ?? [];

  return entries.findLast((entry) => entry.fromSeconds <= anchor.seconds) ?? entries[0] ?? null;
};

export const pieceEndOf = (
  segments: readonly MusicSegment[],
  mediaItemId: number,
  fromSeconds: number,
): number =>
  segments.find(
    (segment) => segment.mediaItemId === mediaItemId && segment.sourceStart === fromSeconds,
  )?.sourceEnd ?? fromSeconds;

export const stretchOf = (placements: FinalPlacements, segment: MusicSegment): number =>
  segmentPlacementOf(placements, segment)?.stretch ?? UNSTRETCHED;

export const matchesAnyMusic = (placements: FinalPlacements): boolean =>
  Object.values(placements).some((entries) => entries.length > 0);

export const matchedCountOf = (
  placements: FinalPlacements,
  segments: readonly MusicSegment[],
): number => segments.filter((segment) => segmentPlacementOf(placements, segment) !== null).length;

const placedSecondsOf = (placement: FinalPlacement, sourceSeconds: number): number =>
  placement.offsetSeconds + sourceSeconds * placement.stretch;

const sourceSecondsOf = (placement: FinalPlacement, finalSeconds: number): number =>
  (finalSeconds - placement.offsetSeconds) / placement.stretch;

const unclampedFinalSecondsOf = (anchor: MusicAnchor | null, mapping: FinalSpan): number | null => {
  const placement =
    anchor === null ? null : anchorPlacementOf(mapping.placements, mapping.segments, anchor);

  if (anchor === null || placement === null) {
    return null;
  }

  const seconds = placedSecondsOf(placement, anchor.seconds);

  return seconds <= mapping.length + EDGE_TOLERANCE_SECONDS ? seconds : null;
};

const finalSecondsOf = (anchor: MusicAnchor | null, mapping: FinalSpan): number | null => {
  const seconds = unclampedFinalSecondsOf(anchor, mapping);

  return seconds === null ? null : Math.min(mapping.length, Math.max(0, seconds));
};

export const finalSecondsAt = (
  segments: readonly MusicSegment[],
  placements: FinalPlacements,
  length: number,
  seconds: number,
): number | null => finalSecondsOf(anchorAt(segments, seconds), { placements, segments, length });

export const mixSecondsAt = (
  segments: readonly MusicSegment[],
  placements: FinalPlacements,
  finalSeconds: number,
): number | null => {
  for (const segment of segments) {
    const placement = segmentPlacementOf(placements, segment);
    const source = placement === null ? null : sourceSecondsOf(placement, finalSeconds);

    if (source !== null && source >= segment.sourceStart && source < segment.sourceEnd) {
      return segment.timelineStart + source - segment.sourceStart;
    }
  }

  return null;
};

const previewStepsOf = (steps: readonly StudioStep[], mapping: FinalMapping): StudioStep[] => {
  const moved = steps.map((step) => ({
    step,
    start:
      step.placement === 'onTimeline' && step.startSeconds !== null
        ? finalSecondsOf(anchorAt(mapping.segments, step.startSeconds), mapping)
        : null,
  }));
  const placed = moved
    .filter((entry) => entry.start !== null)
    .sort((left, right) => (left.start ?? 0) - (right.start ?? 0));
  const adrift = moved.filter((entry) => entry.start === null);

  return [
    ...placed.map(({ step, start }, index) => ({
      ...step,
      startSeconds: index === 0 ? 0 : start,
      endSeconds: placed[index + 1]?.start ?? mapping.length,
      placement: 'onTimeline' as const,
    })),
    ...adrift.map(({ step }) => ({
      ...step,
      startSeconds: null,
      endSeconds: null,
      placement: step.placement === 'onTimeline' ? ('musicMissing' as const) : step.placement,
    })),
  ];
};

const previewVideoOf = (video: StudioVideo, mapping: FinalMapping): StudioVideo => {
  if (video.placement !== 'onTimeline' || video.startSeconds === null) {
    return video;
  }

  const clipStart = video.startSeconds + video.clipStartSeconds;
  const leadIn = Math.max(0, -clipStart);
  const music = unclampedFinalSecondsOf(
    anchorAt(mapping.segments, Math.max(0, clipStart)),
    mapping,
  );

  return music === null
    ? { ...video, startSeconds: null, placement: 'musicMissing' }
    : { ...video, startSeconds: music - leadIn - video.clipStartSeconds };
};

const previewChoreographyOf = (
  choreography: Studio['choreography'],
  mapping: FinalMapping,
): Studio['choreography'] =>
  choreography === null
    ? null
    : {
        ...choreography,
        tracks: choreography.tracks.map((track) => ({
          ...track,
          keyframes: track.keyframes.map((keyframe) => {
            const seconds = finalSecondsOf(keyframe, mapping);

            return seconds === null
              ? keyframe
              : { ...keyframe, sourceMediaItemId: mapping.mediaItemId, seconds };
          }),
        })),
      };

export const finalPreviewOf = <TStudio extends Studio>(
  studio: TStudio,
  track: StudioFinalTrack,
  segments: readonly MusicSegment[],
  placements: FinalPlacements,
): TStudio => {
  const mapping: FinalMapping = {
    placements,
    segments,
    length: track.durationSeconds ?? 0,
    mediaItemId: track.mediaItemId,
  };

  return {
    ...studio,
    music: { lengthSeconds: mapping.length, source: 'finalTrack' },
    finalTracks: studio.finalTracks.map((candidate) => ({
      ...candidate,
      adopted: candidate.finalTrackId === track.finalTrackId,
    })),
    steps: previewStepsOf(studio.steps, mapping),
    videos: studio.videos.map((video) => previewVideoOf(video, mapping)),
    choreography: previewChoreographyOf(studio.choreography, mapping),
  };
};

export const finalPlacesOf = (
  segments: readonly MusicSegment[],
  placements: FinalPlacements,
  length: number,
): FinalPlace[] =>
  segments.map((segment) => {
    const placement = segmentPlacementOf(placements, segment);

    if (placement === null) {
      return { segment, start: null, end: null };
    }

    const start = Math.max(0, placedSecondsOf(placement, segment.sourceStart));
    const end = Math.min(length, placedSecondsOf(placement, segment.sourceEnd));

    return end > start ? { segment, start, end } : { segment, start: null, end: null };
  });

const roundedOffsetOf = (seconds: number): number =>
  Math.round(seconds * OFFSET_GRAIN) / OFFSET_GRAIN;

export const tunedOffsetOf = (offset: number, delta: number): number =>
  roundedOffsetOf(offset + delta);

export const offsetStartingAt = (
  segment: MusicSegment,
  finalSeconds: number,
  stretch: number,
): number => roundedOffsetOf(finalSeconds - segment.sourceStart * stretch);

const finalLimitOf = (track: StudioFinalTrack): number => track.durationSeconds ?? 0;

export const finalBeatAtOf = (track: StudioFinalTrack, seconds: number): number =>
  roundedOffsetOf(Math.min(finalLimitOf(track), Math.max(0, seconds)));

export const nudgedFinalBeatOf = (track: StudioFinalTrack, delta: number): number | null =>
  track.firstBeatSeconds === null ? null : finalBeatAtOf(track, track.firstBeatSeconds + delta);

export const sourceNameOf = (studio: Studio, mediaItemId: number): string => {
  const song = studio.songs.find((candidate) => candidate.mediaItemId === mediaItemId);
  const track = studio.finalTracks.find((candidate) => candidate.mediaItemId === mediaItemId);

  if (song !== undefined) {
    return songNameOf(song.fileName);
  }

  return track === undefined ? '' : finalTitleOf(track.version);
};

export const placeIndexAt = (places: readonly FinalPlace[], seconds: number): number =>
  places.findIndex(
    (place) =>
      place.start !== null && place.end !== null && seconds >= place.start && seconds < place.end,
  );
