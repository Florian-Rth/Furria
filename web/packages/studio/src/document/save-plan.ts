import type { StepSpan } from '../models/step-borders';
import { STEP_BORDER_TOLERANCE_SECONDS, splitsTheTailOf } from '../models/step-borders';
import type { Keyframe } from '../models/studio-schemas';
import type { TimedStep } from './document-projection';
import { timelineStepsOf } from './document-projection';
import { sameValue } from './same-value';
import type { DocumentSong, DocumentStep, StudioDocument } from './studio-document';
import { idsOf, itemOf } from './studio-document';

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
  | { kind: 'stepStart'; stepId: number; atSeconds: number }
  | { kind: 'stepEnd'; stepId: number; atSeconds: number }
  | { kind: 'stepAdd'; stepId: number; startSeconds: number; endSeconds: number }
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

type LeapDirection = 'left' | 'right';

interface StepLeap {
  direction: LeapDirection;
  at: number;
  writes: SaveWrite[];
}

interface StepSpanWrites {
  shrinks: SaveWrite[];
  grows: SaveWrite[];
  leap: StepLeap | null;
}

interface KeptStepWrites {
  stepId: number;
  writes: StepSpanWrites;
}

interface SplitPlan {
  splits: TimedStep[];
  ownerEnds: ReadonlyMap<number, number>;
}

const NO_SPAN_WRITES: StepSpanWrites = { shrinks: [], grows: [], leap: null };

const spanOf = (step: DocumentStep | null): StepSpan | null =>
  step === null || step.startSeconds === null || step.endSeconds === null
    ? null
    : { start: step.startSeconds, end: step.endSeconds };

const timedSpanOf = (step: TimedStep): StepSpan => ({
  start: step.startSeconds,
  end: step.endSeconds,
});

const stepAddOf = (step: TimedStep): SaveWrite => ({
  kind: 'stepAdd',
  stepId: step.stepId,
  startSeconds: step.startSeconds,
  endSeconds: step.endSeconds,
});

const endsBeforeTheSplit = (after: StepSpan | null, added: StepSpan): boolean =>
  after !== null &&
  after.start < added.start - STEP_BORDER_TOLERANCE_SECONDS &&
  after.end <= added.start + STEP_BORDER_TOLERANCE_SECONDS;

const splitOwnerOf = (
  owners: ReadonlyMap<number, StepSpan>,
  current: StudioDocument,
  added: StepSpan,
): number | null => {
  for (const [stepId, owner] of owners) {
    if (
      splitsTheTailOf(owner, added) &&
      endsBeforeTheSplit(spanOf(itemOf(current.steps, stepId)), added)
    ) {
      return stepId;
    }
  }

  return null;
};

const splitPlanOf = (
  kept: ReadonlyMap<number, StepSpan>,
  current: StudioDocument,
  added: readonly TimedStep[],
): SplitPlan => {
  const owners = new Map(kept);
  const ownerEnds = new Map<number, number>();
  const splits: TimedStep[] = [];

  for (const step of [...added].sort((left, right) => right.startSeconds - left.startSeconds)) {
    const ownerId = splitOwnerOf(owners, current, timedSpanOf(step));
    const owner = ownerId === null ? undefined : owners.get(ownerId);
    if (ownerId !== null && owner !== undefined) {
      owners.set(ownerId, { ...owner, end: step.startSeconds });
      ownerEnds.set(ownerId, step.startSeconds);
      splits.push(step);
    }
  }

  return { splits, ownerEnds };
};

const spanWritesOf = (stepId: number, from: StepSpan, to: StepSpan): StepSpanWrites => {
  const start: SaveWrite = { kind: 'stepStart', stepId, atSeconds: to.start };
  const end: SaveWrite = { kind: 'stepEnd', stepId, atSeconds: to.end };
  if (to.end <= from.start) {
    return {
      shrinks: [],
      grows: [],
      leap: { direction: 'left', at: to.start, writes: [start, end] },
    };
  }
  if (to.start >= from.end) {
    return {
      shrinks: [],
      grows: [],
      leap: { direction: 'right', at: to.start, writes: [end, start] },
    };
  }

  return {
    shrinks: [...(to.start > from.start ? [start] : []), ...(to.end < from.end ? [end] : [])],
    grows: [...(to.start < from.start ? [start] : []), ...(to.end > from.end ? [end] : [])],
    leap: null,
  };
};

const leapWritesOf = (kept: readonly KeptStepWrites[], direction: LeapDirection): SaveWrite[] =>
  kept
    .flatMap(({ writes }) => (writes.leap?.direction === direction ? [writes.leap] : []))
    .sort((left, right) => (direction === 'left' ? left.at - right.at : right.at - left.at))
    .flatMap((leap) => leap.writes);

const orderedSpanWritesOf = (
  kept: readonly KeptStepWrites[],
  plan: SplitPlan,
  creates: readonly TimedStep[],
): SaveWrite[] => {
  const borderShrinksOf = (afterSplits: boolean): SaveWrite[] =>
    kept.flatMap(({ stepId, writes }) =>
      writes.shrinks.filter(
        (write) => (write.kind === 'stepEnd' && plan.ownerEnds.has(stepId)) === afterSplits,
      ),
    );

  return [
    ...borderShrinksOf(false),
    ...plan.splits.map(stepAddOf),
    ...borderShrinksOf(true),
    ...leapWritesOf(kept, 'left'),
    ...leapWritesOf(kept, 'right'),
    ...creates.map(stepAddOf),
    ...kept.flatMap(({ writes }) => writes.grows),
  ];
};

const stepSpanWritesOf = (saved: StudioDocument, current: StudioDocument): SaveWrite[] => {
  const added = timelineStepsOf(current).filter(
    (step) => itemOf(saved.steps, step.stepId) === null,
  );
  const keptSpans = new Map(
    keptIdsOf(saved.steps, current.steps).flatMap((stepId): [number, StepSpan][] => {
      const span = spanOf(itemOf(saved.steps, stepId));

      return span === null ? [] : [[stepId, span]];
    }),
  );
  const plan = splitPlanOf(keptSpans, current, added);
  const kept = [...keptSpans].map(([stepId, span]): KeptStepWrites => {
    const to = spanOf(itemOf(current.steps, stepId));
    const from = { start: span.start, end: plan.ownerEnds.get(stepId) ?? span.end };

    return { stepId, writes: to === null ? NO_SPAN_WRITES : spanWritesOf(stepId, from, to) };
  });
  const splitIds = new Set(plan.splits.map((step) => step.stepId));

  return orderedSpanWritesOf(
    kept,
    plan,
    added.filter((step) => !splitIds.has(step.stepId)),
  );
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
  ...stepSpanWritesOf(saved, current),
  ...stepNamesOf(saved, current),
  ...orderedPartWritesOf(saved, current),
  ...videoWritesOf(saved, current),
  ...trackWritesOf(saved, current),
];
