import type { MusicAnchor, MusicSegment } from '@/features/act-player/music-timeline';
import { EDGE_TOLERANCE_SECONDS } from '@/features/act-player/music-timeline';
import type { Studio, StudioFinalTrack, StudioStep, StudioVideo } from '@/features/acts/schemas';
import { finalTitleOf, songNameOf } from './studio-copy';
import { anchorAt } from './studio-formation';
import type { HoldsStudio } from './studio-music';
import { withStudio } from './studio-music';

const OFFSET_GRAIN = 1000;

export type FinalOffsets = Readonly<Record<number, number>>;

export interface FinalOffsetInput {
  finalTrackId: number;
  sourceMediaItemId: number;
  offsetSeconds: number;
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
  offsets: FinalOffsets;
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

export const finalOffsetsOf = (
  track: StudioFinalTrack,
  segments: readonly MusicSegment[],
): FinalOffsets =>
  Object.fromEntries(
    track.alignments
      .filter((alignment) =>
        segments.some((segment) => segment.mediaItemId === alignment.sourceMediaItemId),
      )
      .map((alignment) => [alignment.sourceMediaItemId, alignment.offsetSeconds]),
  );

export const matchesAnyMusic = (offsets: FinalOffsets): boolean => Object.keys(offsets).length > 0;

const finalSecondsOf = (anchor: MusicAnchor | null, mapping: FinalSpan): number | null => {
  const offset = anchor === null ? undefined : mapping.offsets[anchor.sourceMediaItemId];

  if (anchor === null || offset === undefined) {
    return null;
  }

  const seconds = anchor.seconds + offset;

  return seconds >= -EDGE_TOLERANCE_SECONDS && seconds <= mapping.length + EDGE_TOLERANCE_SECONDS
    ? Math.min(mapping.length, Math.max(0, seconds))
    : null;
};

export const finalSecondsAt = (
  segments: readonly MusicSegment[],
  offsets: FinalOffsets,
  length: number,
  seconds: number,
): number | null => finalSecondsOf(anchorAt(segments, seconds), { offsets, length });

export const mixSecondsAt = (
  segments: readonly MusicSegment[],
  offsets: FinalOffsets,
  finalSeconds: number,
): number | null => {
  for (const segment of segments) {
    const offset = offsets[segment.mediaItemId];
    const source = offset === undefined ? null : finalSeconds - offset;

    if (source !== null && source >= segment.sourceStart && source < segment.sourceEnd) {
      return segment.timelineStart + source - segment.sourceStart;
    }
  }

  return null;
};

const previewStepsOf = (
  steps: readonly StudioStep[],
  segments: readonly MusicSegment[],
  mapping: FinalMapping,
): StudioStep[] => {
  const moved = steps.map((step) => ({
    step,
    start:
      step.placement === 'onTimeline' && step.startSeconds !== null
        ? finalSecondsOf(anchorAt(segments, step.startSeconds), mapping)
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

const previewVideoOf = (
  video: StudioVideo,
  segments: readonly MusicSegment[],
  mapping: FinalMapping,
): StudioVideo => {
  if (video.placement !== 'onTimeline' || video.startSeconds === null) {
    return video;
  }

  const leadIn = Math.max(0, -video.startSeconds);
  const music = finalSecondsOf(anchorAt(segments, Math.max(0, video.startSeconds)), mapping);

  return music === null
    ? { ...video, startSeconds: null, placement: 'musicMissing' }
    : { ...video, startSeconds: music - leadIn };
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

export const finalPreviewOf = (
  studio: Studio,
  track: StudioFinalTrack,
  segments: readonly MusicSegment[],
  offsets: FinalOffsets,
): Studio => {
  const mapping: FinalMapping = {
    offsets,
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
    steps: previewStepsOf(studio.steps, segments, mapping),
    videos: studio.videos.map((video) => previewVideoOf(video, segments, mapping)),
    choreography: previewChoreographyOf(studio.choreography, mapping),
  };
};

export const finalPlacesOf = (
  segments: readonly MusicSegment[],
  offsets: FinalOffsets,
  length: number,
): FinalPlace[] =>
  segments.map((segment) => {
    const offset = offsets[segment.mediaItemId];

    if (offset === undefined) {
      return { segment, start: null, end: null };
    }

    const start = Math.max(0, segment.sourceStart + offset);
    const end = Math.min(length, segment.sourceEnd + offset);

    return end > start ? { segment, start, end } : { segment, start: null, end: null };
  });

const roundedOffsetOf = (seconds: number): number =>
  Math.round(seconds * OFFSET_GRAIN) / OFFSET_GRAIN;

export const tunedOffsetOf = (offset: number, delta: number): number =>
  roundedOffsetOf(offset + delta);

export const offsetStartingAt = (segment: MusicSegment, finalSeconds: number): number =>
  roundedOffsetOf(finalSeconds - segment.sourceStart);

export const withFinalOffset = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { finalTrackId, sourceMediaItemId, offsetSeconds }: FinalOffsetInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    finalTracks: studio.finalTracks.map((track) =>
      track.finalTrackId === finalTrackId
        ? {
            ...track,
            alignments: [
              ...track.alignments.filter(
                (alignment) => alignment.sourceMediaItemId !== sourceMediaItemId,
              ),
              { sourceMediaItemId, offsetSeconds },
            ],
          }
        : track,
    ),
  }));

export const withFinalBeat = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { finalTrackId, firstBeatSeconds, tempoBpm }: FinalBeatInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    finalTracks: studio.finalTracks.map((track) =>
      track.finalTrackId === finalTrackId ? { ...track, firstBeatSeconds, tempoBpm } : track,
    ),
  }));

export const withoutFinalTrack = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  finalTrackId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    finalTracks: studio.finalTracks.filter((track) => track.finalTrackId !== finalTrackId),
  }));

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
