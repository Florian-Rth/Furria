import { musicLengthOf, musicSegmentsOf } from '../models/music-timeline';
import type {
  Studio,
  StudioFinalTrack,
  StudioPart,
  StudioSong,
  StudioSpot,
  StudioStep,
  StudioVideo,
} from '../models/studio-schemas';
import type {
  DocumentFinalTrack,
  DocumentPart,
  DocumentStep,
  StudioDocument,
} from './studio-document';
import { idsOf, itemOf } from './studio-document';

const NO_CHOREOGRAPHY_VERSION = 0;

const documentAlignmentsOf = (track: StudioFinalTrack): DocumentFinalTrack['alignments'] => {
  const alignments: DocumentFinalTrack['alignments'] = {};

  for (const { sourceMediaItemId, fromSeconds, offsetSeconds, stretch } of track.alignments) {
    alignments[sourceMediaItemId] = [
      ...(alignments[sourceMediaItemId] ?? []),
      { fromSeconds, offsetSeconds, stretch },
    ].sort((left, right) => left.fromSeconds - right.fromSeconds);
  }

  return alignments;
};

export const documentOf = (studio: Studio): StudioDocument => ({
  songOrder: [...studio.songs]
    .sort((left, right) => left.position - right.position)
    .map((song) => song.songId),
  songs: Object.fromEntries(
    studio.songs.map((song) => [
      song.songId,
      {
        pieces: song.pieces.map((piece) => ({ ...piece })),
        firstBeatSeconds: song.firstBeatSeconds,
        tempoBpm: song.tempoBpm,
      },
    ]),
  ),
  steps: Object.fromEntries(
    studio.steps.map((step) => [step.stepId, { startSeconds: step.startSeconds, name: step.name }]),
  ),
  parts: Object.fromEntries(
    studio.parts.map((part) => [
      part.partId,
      {
        name: part.name,
        firstStepId: part.stepIds.length === 0 ? null : part.firstStepId,
        lastStepId: part.stepIds.length === 0 ? null : part.lastStepId,
        mainVideoId: part.mainVideoId,
      },
    ]),
  ),
  spotOrder: [...studio.spots]
    .sort((left, right) => left.number - right.number)
    .map((spot) => spot.spotId),
  spots: Object.fromEntries(studio.spots.map((spot) => [spot.spotId, { person: spot.person }])),
  tracks: Object.fromEntries(
    (studio.choreography?.tracks ?? []).map((track) => [track.spotId, [...track.keyframes]]),
  ),
  videos: Object.fromEntries(
    studio.videos.map((video) => [
      video.videoId,
      {
        name: video.name,
        startSeconds: video.startSeconds,
        clipStartSeconds: video.clipStartSeconds,
        clipEndSeconds: video.clipEndSeconds,
      },
    ]),
  ),
  finalTracks: Object.fromEntries(
    studio.finalTracks.map((track) => [
      track.finalTrackId,
      {
        firstBeatSeconds: track.firstBeatSeconds,
        tempoBpm: track.tempoBpm,
        alignments: documentAlignmentsOf(track),
      },
    ]),
  ),
});

export interface TimedStep {
  stepId: number;
  startSeconds: number;
}

export const timelineStepsOf = (document: StudioDocument): TimedStep[] =>
  idsOf(document.steps)
    .flatMap((stepId) => {
      const start = itemOf(document.steps, stepId)?.startSeconds ?? null;

      return start === null ? [] : [{ stepId, startSeconds: start }];
    })
    .sort((left, right) => left.startSeconds - right.startSeconds || left.stepId - right.stepId);

const OPENING_SECONDS = 0;

export const stepBordersOf = (document: StudioDocument): TimedStep[] =>
  timelineStepsOf(document).map((step, index) =>
    index === 0 ? { ...step, startSeconds: OPENING_SECONDS } : step,
  );

const songsOf = (base: Studio, document: StudioDocument): StudioSong[] =>
  base.songs.flatMap((song) => {
    const settings = itemOf(document.songs, song.songId);
    const position = document.songOrder.indexOf(song.songId);

    return settings === null ? [] : [{ ...song, ...settings, position }];
  });

const projectedStepOf = (
  base: StudioStep | undefined,
  stepId: number,
  step: DocumentStep,
  endSeconds: number | null,
): StudioStep => ({
  stepId,
  name: step.name,
  startSeconds: step.startSeconds,
  endSeconds,
  placement: step.startSeconds === null ? (base?.placement ?? 'cutAway') : 'onTimeline',
});

const stepsOf = (base: Studio, document: StudioDocument, lengthSeconds: number): StudioStep[] => {
  const timeline = stepBordersOf(document);
  const placed = timeline.flatMap(({ stepId, startSeconds }, index) => {
    const step = itemOf(document.steps, stepId);

    return step === null
      ? []
      : [
          projectedStepOf(
            base.steps.find((known) => known.stepId === stepId),
            stepId,
            { ...step, startSeconds },
            timeline[index + 1]?.startSeconds ?? lengthSeconds,
          ),
        ];
  });
  const unplaced = base.steps.flatMap((known) => {
    const step = itemOf(document.steps, known.stepId);

    return step === null || step.startSeconds !== null
      ? []
      : [projectedStepOf(known, known.stepId, step, null)];
  });

  return [...placed, ...unplaced];
};

const isAdrift = (base: Studio, partId: number): boolean =>
  base.parts.find((known) => known.partId === partId)?.adrift ?? false;

const rangeStepIdsOf = (part: DocumentPart, order: readonly number[]): number[] => {
  const first = part.firstStepId === null ? -1 : order.indexOf(part.firstStepId);
  const last = part.lastStepId === null ? -1 : order.indexOf(part.lastStepId);

  return first < 0 || last < first ? [] : order.slice(first, last + 1);
};

const partStepIdsOf = (base: Studio, document: StudioDocument): Map<number, number[]> => {
  const order = timelineStepsOf(document).map((step) => step.stepId);

  return new Map(
    idsOf(document.parts).flatMap((partId): [number, number[]][] => {
      const part = itemOf(document.parts, partId);
      const stepIds = part === null || isAdrift(base, partId) ? [] : rangeStepIdsOf(part, order);

      return stepIds.length === 0 ? [] : [[partId, stepIds]];
    }),
  );
};

const projectedPartOf = (
  base: StudioPart | undefined,
  partId: number,
  part: DocumentPart,
  stepIds: number[],
): StudioPart => ({
  partId,
  name: part.name,
  firstStepId: stepIds[0] ?? part.firstStepId ?? base?.firstStepId ?? 0,
  lastStepId: stepIds.at(-1) ?? part.lastStepId ?? base?.lastStepId ?? 0,
  mainVideoId: part.mainVideoId,
  adrift: base?.adrift ?? false,
  stepIds,
});

const partsOf = (base: Studio, document: StudioDocument): StudioPart[] => {
  const placed = partStepIdsOf(base, document);
  const known = new Set(base.parts.map((part) => part.partId));
  const adriftStepIdsOf = (part: StudioPart | undefined): number[] =>
    (part?.stepIds ?? []).filter((stepId) => itemOf(document.steps, stepId) !== null);
  const projected = (partId: number): StudioPart[] => {
    const part = itemOf(document.parts, partId);
    const baseline = base.parts.find((candidate) => candidate.partId === partId);
    const stepIds = placed.get(partId) ?? adriftStepIdsOf(baseline);

    return part === null || (stepIds.length === 0 && !(baseline?.adrift ?? false))
      ? []
      : [projectedPartOf(baseline, partId, part, stepIds)];
  };

  return [
    ...base.parts.flatMap((part) => projected(part.partId)),
    ...idsOf(document.parts)
      .filter((partId) => !known.has(partId))
      .flatMap(projected),
  ];
};

const spotsOf = (document: StudioDocument): StudioSpot[] =>
  document.spotOrder.flatMap((spotId, index) => {
    const spot = itemOf(document.spots, spotId);

    return spot === null ? [] : [{ spotId, number: index + 1, person: spot.person }];
  });

const choreographyOf = (base: Studio, document: StudioDocument): Studio['choreography'] => {
  const tracks = document.spotOrder.flatMap((spotId) => {
    const keyframes = itemOf(document.tracks, spotId);

    return keyframes === null ? [] : [{ spotId, keyframes: [...keyframes] }];
  });

  return base.choreography === null && tracks.length === 0
    ? null
    : { version: base.choreography?.version ?? NO_CHOREOGRAPHY_VERSION, tracks };
};

const videosOf = (base: Studio, document: StudioDocument): StudioVideo[] =>
  base.videos.flatMap((video) => {
    const edited = itemOf(document.videos, video.videoId);
    if (edited === null) {
      return [];
    }

    const moved = edited.startSeconds !== null && edited.startSeconds !== video.startSeconds;

    return [{ ...video, ...edited, placement: moved ? 'onTimeline' : video.placement }];
  });

const finalTracksOf = (base: Studio, document: StudioDocument): StudioFinalTrack[] =>
  base.finalTracks.flatMap((track) => {
    const edited = itemOf(document.finalTracks, track.finalTrackId);

    return edited === null
      ? []
      : [
          {
            ...track,
            firstBeatSeconds: edited.firstBeatSeconds,
            tempoBpm: edited.tempoBpm,
            alignments: idsOf(edited.alignments).flatMap((sourceMediaItemId) =>
              (itemOf(edited.alignments, sourceMediaItemId) ?? []).map((alignment) => ({
                sourceMediaItemId,
                ...alignment,
              })),
            ),
          },
        ];
  });

export const studioOf = <TStudio extends Studio>(
  base: TStudio,
  document: StudioDocument,
): TStudio => {
  const songs = songsOf(base, document);
  const finalTracks = finalTracksOf(base, document);
  const lengthSeconds =
    base.music.source === 'workingMix'
      ? musicLengthOf(musicSegmentsOf({ ...base, songs, finalTracks }))
      : base.music.lengthSeconds;

  return {
    ...base,
    music: { ...base.music, lengthSeconds },
    songs,
    finalTracks,
    steps: stepsOf(base, document, lengthSeconds),
    parts: partsOf(base, document),
    spots: spotsOf(document),
    videos: videosOf(base, document),
    choreography: choreographyOf(base, document),
  };
};
