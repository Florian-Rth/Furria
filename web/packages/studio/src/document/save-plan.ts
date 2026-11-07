import type { Keyframe } from '../models/studio-schemas';
import type { TimedStep } from './document-projection';
import { timelineStepsOf } from './document-projection';
import { sameValue } from './same-value';
import type { DocumentSong, StudioDocument } from './studio-document';
import { idsOf, itemOf } from './studio-document';

const OPENING_TOLERANCE_SECONDS = 0.01;

export interface SavedTrack {
  spotId: number;
  keyframes: readonly Keyframe[];
}

export type SaveWrite =
  | { kind: 'songOrder'; songIds: readonly number[] }
  | { kind: 'songSettings'; songId: number; settings: DocumentSong }
  | {
      kind: 'finalBeat';
      finalTrackId: number;
      firstBeatSeconds: number | null;
      tempoBpm: number | null;
    }
  | {
      kind: 'finalOffset';
      finalTrackId: number;
      sourceMediaItemId: number;
      fromSeconds: number;
      offsetSeconds: number;
      stretch: number;
    }
  | { kind: 'spotRemove'; spotId: number }
  | { kind: 'spotAdd'; spotId: number }
  | { kind: 'spotAssign'; spotId: number; personId: number | null }
  | { kind: 'partRemove'; partId: number }
  | { kind: 'stepRemove'; stepId: number }
  | { kind: 'stepMove'; stepId: number; atSeconds: number }
  | { kind: 'stepMark'; stepId: number; openingStepId: number | null; atSeconds: number }
  | { kind: 'stepName'; stepId: number; name: string }
  | { kind: 'partAdd'; partId: number; firstStepId: number; lastStepId: number; name: string }
  | {
      kind: 'partSettings';
      partId: number;
      name: string;
      firstStepId: number;
      lastStepId: number;
      mainVideoId: number | null;
    }
  | { kind: 'videoName'; videoId: number; name: string | null }
  | { kind: 'videoStart'; videoId: number; startSeconds: number }
  | { kind: 'videoClip'; videoId: number; startSeconds: number; endSeconds: number }
  | { kind: 'tracks'; tracks: readonly SavedTrack[] };

const keptIdsOf = <TItem>(
  saved: Readonly<Record<number, TItem>>,
  current: Readonly<Record<number, TItem>>,
): number[] => idsOf(current).filter((id) => itemOf(saved, id) !== null);

const addedIdsOf = <TItem>(
  saved: Readonly<Record<number, TItem>>,
  current: Readonly<Record<number, TItem>>,
): number[] => idsOf(current).filter((id) => itemOf(saved, id) === null);

const removedIdsOf = <TItem>(
  saved: Readonly<Record<number, TItem>>,
  current: Readonly<Record<number, TItem>>,
): number[] => addedIdsOf(current, saved);

const musicWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => [
  ...(sameValue(saved.songOrder, current.songOrder)
    ? []
    : [{ kind: 'songOrder' as const, songIds: current.songOrder }]),
  ...keptIdsOf(saved.songs, current.songs).flatMap((songId) => {
    const settings = itemOf(current.songs, songId);

    return settings === null || sameValue(itemOf(saved.songs, songId), settings)
      ? []
      : [{ kind: 'songSettings' as const, songId, settings }];
  }),
  ...keptIdsOf(saved.finalTracks, current.finalTracks).flatMap((finalTrackId) => {
    const before = itemOf(saved.finalTracks, finalTrackId);
    const after = itemOf(current.finalTracks, finalTrackId);
    if (before === null || after === null) {
      return [];
    }

    const beat: SaveWrite[] =
      before.firstBeatSeconds === after.firstBeatSeconds && before.tempoBpm === after.tempoBpm
        ? []
        : [
            {
              kind: 'finalBeat',
              finalTrackId,
              firstBeatSeconds: after.firstBeatSeconds,
              tempoBpm: after.tempoBpm,
            },
          ];
    const offsets = idsOf(after.alignments).flatMap((sourceMediaItemId): SaveWrite[] => {
      const known = itemOf(before.alignments, sourceMediaItemId) ?? [];

      return (itemOf(after.alignments, sourceMediaItemId) ?? []).flatMap(
        (alignment): SaveWrite[] => {
          const saved = known.find((entry) => entry.fromSeconds === alignment.fromSeconds);

          return saved !== undefined && sameValue(saved, alignment)
            ? []
            : [{ kind: 'finalOffset', finalTrackId, sourceMediaItemId, ...alignment }];
        },
      );
    });

    return [...beat, ...offsets];
  }),
];

const spotWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const added = current.spotOrder.filter((spotId) => itemOf(saved.spots, spotId) === null);

  return [
    ...removedIdsOf(saved.spots, current.spots).map(
      (spotId): SaveWrite => ({ kind: 'spotRemove', spotId }),
    ),
    ...added.map((spotId): SaveWrite => ({ kind: 'spotAdd', spotId })),
    ...current.spotOrder.flatMap((spotId): SaveWrite[] => {
      const personId = itemOf(current.spots, spotId)?.person?.personId ?? null;
      const savedPersonId = itemOf(saved.spots, spotId)?.person?.personId ?? null;

      return personId === savedPersonId ? [] : [{ kind: 'spotAssign', spotId, personId }];
    }),
  ];
};

const stepMovesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const moves = keptIdsOf(saved.steps, current.steps).flatMap((stepId) => {
    const from = itemOf(saved.steps, stepId)?.startSeconds ?? null;
    const to = itemOf(current.steps, stepId)?.startSeconds ?? null;

    return from === null || to === null || from === to ? [] : [{ stepId, from, to }];
  });
  const later = moves
    .filter((move) => move.to > move.from)
    .sort((left, right) => right.to - left.to);
  const earlier = moves
    .filter((move) => move.to < move.from)
    .sort((left, right) => left.to - right.to);

  return [...later, ...earlier].map(({ stepId, to }) => ({
    kind: 'stepMove',
    stepId,
    atSeconds: to,
  }));
};

const stepMarksOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const added = timelineStepsOf(current).filter(
    (step) => itemOf(saved.steps, step.stepId) === null,
  );
  const [first, second, ...rest] = added;
  if (first === undefined) {
    return [];
  }

  const opensTheTimeline =
    timelineStepsOf(saved).length === 0 &&
    first.startSeconds <= OPENING_TOLERANCE_SECONDS &&
    second !== undefined;
  const marks: (TimedStep & { openingStepId: number | null })[] = opensTheTimeline
    ? [
        { ...second, openingStepId: first.stepId },
        ...rest.map((step) => ({ ...step, openingStepId: null })),
      ]
    : added.map((step) => ({ ...step, openingStepId: null }));

  return marks.map((step) => ({
    kind: 'stepMark',
    stepId: step.stepId,
    openingStepId: step.openingStepId,
    atSeconds: step.startSeconds,
  }));
};

const stepNamesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] =>
  idsOf(current.steps).flatMap((stepId): SaveWrite[] => {
    const step = itemOf(current.steps, stepId);
    const before = itemOf(saved.steps, stepId) ?? { name: '' };

    return step === null || step.name === before.name
      ? []
      : [{ kind: 'stepName', stepId, name: step.name }];
  });

type PartSettingsWrite = Extract<SaveWrite, { kind: 'partSettings' }>;

const partWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] =>
  idsOf(current.parts).flatMap((partId): SaveWrite[] => {
    const part = itemOf(current.parts, partId);
    const before = itemOf(saved.parts, partId);
    if (part === null || part.firstStepId === null || part.lastStepId === null) {
      return [];
    }

    const settings: SaveWrite = {
      kind: 'partSettings',
      partId,
      name: part.name,
      firstStepId: part.firstStepId,
      lastStepId: part.lastStepId,
      mainVideoId: part.mainVideoId,
    };
    if (before === null) {
      const add: SaveWrite = {
        kind: 'partAdd',
        partId,
        firstStepId: part.firstStepId,
        lastStepId: part.lastStepId,
        name: part.name,
      };

      return part.mainVideoId === null ? [add] : [add, settings];
    }

    return sameValue(before, part) ? [] : [settings];
  });

const shrinksOf = (
  saved: StudioDocument,
  order: readonly number[],
  write: PartSettingsWrite,
): boolean => {
  const before = itemOf(saved.parts, write.partId);
  const from = order.indexOf(before?.firstStepId ?? -1);
  const until = order.indexOf(before?.lastStepId ?? -1);

  return (
    from >= 0 &&
    until >= 0 &&
    order.indexOf(write.firstStepId) >= from &&
    order.indexOf(write.lastStepId) <= until
  );
};

const orderedPartWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const writes = partWritesOf(saved, current);
  const order = timelineStepsOf(current).map((step) => step.stepId);
  const added = new Set(
    writes.flatMap((write) => (write.kind === 'partAdd' ? [write.partId] : [])),
  );
  const settings = writes.filter(
    (write): write is PartSettingsWrite =>
      write.kind === 'partSettings' && !added.has(write.partId),
  );

  return [
    ...settings.filter((write) => shrinksOf(saved, order, write)),
    ...writes.filter(
      (write) =>
        write.kind === 'partAdd' || (write.kind === 'partSettings' && added.has(write.partId)),
    ),
    ...settings.filter((write) => !shrinksOf(saved, order, write)),
  ];
};

const videoWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] =>
  keptIdsOf(saved.videos, current.videos).flatMap((videoId): SaveWrite[] => {
    const before = itemOf(saved.videos, videoId);
    const after = itemOf(current.videos, videoId);
    if (before === null || after === null) {
      return [];
    }

    return [
      ...(before.name === after.name
        ? []
        : [{ kind: 'videoName' as const, videoId, name: after.name }]),
      ...(after.startSeconds === null || before.startSeconds === after.startSeconds
        ? []
        : [{ kind: 'videoStart' as const, videoId, startSeconds: after.startSeconds }]),
      ...(after.clipEndSeconds === null ||
      (before.clipStartSeconds === after.clipStartSeconds &&
        before.clipEndSeconds === after.clipEndSeconds)
        ? []
        : [
            {
              kind: 'videoClip' as const,
              videoId,
              startSeconds: after.clipStartSeconds,
              endSeconds: after.clipEndSeconds,
            },
          ]),
    ];
  });

const trackWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const tracks = current.spotOrder.flatMap((spotId) => {
    const keyframes = itemOf(current.tracks, spotId) ?? [];
    const before = itemOf(saved.tracks, spotId) ?? [];

    return sameValue(before, keyframes) ? [] : [{ spotId, keyframes }];
  });

  return tracks.length === 0 ? [] : [{ kind: 'tracks', tracks }];
};

export const savePlanOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => [
  ...musicWritesOf(saved, current),
  ...spotWritesOf(saved, current),
  ...removedIdsOf(saved.parts, current.parts).map(
    (partId): SaveWrite => ({ kind: 'partRemove', partId }),
  ),
  ...removedIdsOf(saved.steps, current.steps).map(
    (stepId): SaveWrite => ({ kind: 'stepRemove', stepId }),
  ),
  ...stepMovesOf(saved, current),
  ...stepMarksOf(saved, current),
  ...stepNamesOf(saved, current),
  ...orderedPartWritesOf(saved, current),
  ...videoWritesOf(saved, current),
  ...trackWritesOf(saved, current),
];
