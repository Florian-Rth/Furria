import type { Draft } from 'immer';
import { nearBorder, STEP_BORDER_TOLERANCE_SECONDS } from '../models/step-borders';
import type { Keyframe, StudioPerson } from '../models/studio-schemas';
import type { TimedStep } from './document-projection';
import { timelineStepsOf } from './document-projection';
import { sameValue } from './same-value';
import type { SongSettings, StudioDocument } from './studio-document';
import { idsOf, itemOf } from './studio-document';

export type StudioChange =
  | { kind: 'songOrder'; songIds: readonly number[] }
  | ({ kind: 'songSettings'; songId: number } & SongSettings)
  | {
      kind: 'stepMark';
      stepId: number;
      openingStepId: number;
      atSeconds: number;
      lengthSeconds: number;
    }
  | { kind: 'stepMove'; stepId: number; atSeconds: number }
  | { kind: 'stepName'; stepId: number; name: string }
  | { kind: 'stepRemove'; stepId: number }
  | { kind: 'partAdd'; partId: number; firstStepId: number; lastStepId: number; name: string }
  | {
      kind: 'partSettings';
      partId: number;
      name: string;
      firstStepId: number;
      lastStepId: number;
      mainVideoId: number | null;
    }
  | { kind: 'partRemove'; partId: number }
  | { kind: 'videoName'; videoId: number; name: string | null }
  | { kind: 'videoStart'; videoId: number; startSeconds: number }
  | { kind: 'videoClip'; videoId: number; startSeconds: number; endSeconds: number }
  | { kind: 'spotAdd'; spotId: number }
  | { kind: 'spotRemove'; spotId: number }
  | { kind: 'spotAssign'; spotId: number; person: StudioPerson | null }
  | { kind: 'tracks'; tracks: Readonly<Record<number, readonly Keyframe[]>> };

type Edit<TKind extends StudioChange['kind']> = (
  draft: Draft<StudioDocument>,
  change: Extract<StudioChange, { kind: TKind }>,
) => void;

const liesOnABorder = (timeline: readonly TimedStep[], seconds: number): boolean =>
  timeline.some(
    (step) => nearBorder(step.startSeconds, seconds) || nearBorder(step.endSeconds, seconds),
  );

const holdingStepOf = (timeline: readonly TimedStep[], seconds: number): TimedStep | null =>
  timeline.find(
    (step) =>
      seconds > step.startSeconds + STEP_BORDER_TOLERANCE_SECONDS &&
      seconds < step.endSeconds - STEP_BORDER_TOLERANCE_SECONDS,
  ) ?? null;

const insideTheMusic = (seconds: number, lengthSeconds: number): boolean =>
  seconds >= 0 && seconds < lengthSeconds - STEP_BORDER_TOLERANCE_SECONDS;

const withinTheMusicOf = (timeline: readonly TimedStep[], lengthSeconds: number): TimedStep[] =>
  timeline.filter((step) => step.endSeconds <= lengthSeconds + STEP_BORDER_TOLERANCE_SECONDS);

const touchingBeforeOf = (timeline: readonly TimedStep[], index: number): TimedStep | null => {
  const before = timeline[index - 1];
  const after = timeline[index];

  return before !== undefined &&
    after !== undefined &&
    nearBorder(before.endSeconds, after.startSeconds)
    ? before
    : null;
};

const stepSplit = (
  draft: Draft<StudioDocument>,
  holding: TimedStep,
  stepId: number,
  atSeconds: number,
): void => {
  const owner = itemOf(draft.steps, holding.stepId);
  if (owner === null) {
    return;
  }

  draft.steps[stepId] = { startSeconds: atSeconds, endSeconds: holding.endSeconds, name: '' };
  owner.endSeconds = atSeconds;
  for (const partId of idsOf(draft.parts)) {
    const part = itemOf(draft.parts, partId);
    if (part !== null && part.lastStepId === holding.stepId) {
      part.lastStepId = stepId;
    }
  }
};

const stepMarked: Edit<'stepMark'> = (
  draft,
  { stepId, openingStepId, atSeconds, lengthSeconds },
) => {
  const timeline = withinTheMusicOf(timelineStepsOf(draft), lengthSeconds);
  if (
    !insideTheMusic(atSeconds, lengthSeconds) ||
    itemOf(draft.steps, stepId) !== null ||
    liesOnABorder(timeline, atSeconds)
  ) {
    return;
  }

  const holding = holdingStepOf(timeline, atSeconds);
  if (holding !== null) {
    stepSplit(draft, holding, stepId, atSeconds);
    return;
  }

  if (timeline.length === 0 && atSeconds > STEP_BORDER_TOLERANCE_SECONDS) {
    draft.steps[openingStepId] = { startSeconds: 0, endSeconds: atSeconds, name: '' };
  }
  const following = timeline.find((step) => step.startSeconds > atSeconds);
  draft.steps[stepId] = {
    startSeconds: atSeconds,
    endSeconds: following?.startSeconds ?? lengthSeconds,
    name: '',
  };
};

const stepMoved: Edit<'stepMove'> = (draft, { stepId, atSeconds }) => {
  const timeline = timelineStepsOf(draft);
  const index = timeline.findIndex((step) => step.stepId === stepId);
  const moved = timeline[index];
  const step = itemOf(draft.steps, stepId);
  if (moved === undefined || step === null) {
    return;
  }

  const touching = touchingBeforeOf(timeline, index);
  const fitsBefore =
    touching === null
      ? atSeconds >= (timeline[index - 1]?.endSeconds ?? 0)
      : atSeconds > touching.startSeconds + STEP_BORDER_TOLERANCE_SECONDS;
  if (!fitsBefore || atSeconds >= moved.endSeconds - STEP_BORDER_TOLERANCE_SECONDS) {
    return;
  }

  step.startSeconds = atSeconds;
  const previous = touching === null ? null : itemOf(draft.steps, touching.stepId);
  if (previous !== null) {
    previous.endSeconds = atSeconds;
  }
};

const stepRenamed: Edit<'stepName'> = (draft, { stepId, name }) => {
  const step = itemOf(draft.steps, stepId);
  if (step !== null) {
    step.name = name;
  }
};

const orderOf = (document: StudioDocument): number[] =>
  timelineStepsOf(document).map((step) => step.stepId);

interface StepRange {
  first: number;
  last: number;
}

const rangeOf = (
  order: readonly number[],
  firstStepId: number | null,
  lastStepId: number | null,
): StepRange | null => {
  const first = firstStepId === null ? -1 : order.indexOf(firstStepId);
  const last = lastStepId === null ? -1 : order.indexOf(lastStepId);

  return first < 0 || last < first ? null : { first, last };
};

const overlaps = (left: StepRange, right: StepRange): boolean =>
  left.first <= right.last && right.first <= left.last;

const rangeFits = (
  document: StudioDocument,
  partId: number,
  firstStepId: number,
  lastStepId: number,
): boolean => {
  const order = orderOf(document);
  const wanted = rangeOf(order, firstStepId, lastStepId);

  return (
    wanted !== null &&
    idsOf(document.parts).every((otherId) => {
      const other = itemOf(document.parts, otherId);
      const range = other === null ? null : rangeOf(order, other.firstStepId, other.lastStepId);
      return otherId === partId || range === null || !overlaps(range, wanted);
    })
  );
};

export const dropStep = (draft: Draft<StudioDocument>, stepId: number): void => {
  if (itemOf(draft.steps, stepId) === null) {
    return;
  }

  const order = orderOf(draft);
  const index = order.indexOf(stepId);
  const previous = index < 0 ? undefined : order[index - 1];
  const next = index < 0 ? undefined : order[index + 1];

  for (const partId of idsOf(draft.parts)) {
    const part = itemOf(draft.parts, partId);
    if (part !== null && part.firstStepId === stepId && part.lastStepId === stepId) {
      delete draft.parts[partId];
    } else if (part !== null && part.firstStepId === stepId) {
      part.firstStepId = next ?? null;
    } else if (part !== null && part.lastStepId === stepId) {
      part.lastStepId = previous ?? null;
    }
  }
  delete draft.steps[stepId];
};

const stepRemoved: Edit<'stepRemove'> = (draft, { stepId }) => {
  const timeline = timelineStepsOf(draft);
  const index = timeline.findIndex((step) => step.stepId === stepId);
  const removed = timeline[index];
  const touching = index < 0 ? null : touchingBeforeOf(timeline, index);
  const absorbing = touching === null ? null : itemOf(draft.steps, touching.stepId);

  if (absorbing !== null && removed !== undefined) {
    absorbing.endSeconds = removed.endSeconds;
  }
  dropStep(draft, stepId);
};

const partAdded: Edit<'partAdd'> = (draft, { partId, firstStepId, lastStepId, name }) => {
  if (itemOf(draft.parts, partId) === null && rangeFits(draft, partId, firstStepId, lastStepId)) {
    draft.parts[partId] = { name, firstStepId, lastStepId, mainVideoId: null };
  }
};

const partSet: Edit<'partSettings'> = (
  draft,
  { partId, name, firstStepId, lastStepId, mainVideoId },
) => {
  const part = itemOf(draft.parts, partId);
  if (part === null) {
    return;
  }

  part.name = name;
  part.mainVideoId = mainVideoId;
  if (rangeFits(draft, partId, firstStepId, lastStepId)) {
    part.firstStepId = firstStepId;
    part.lastStepId = lastStepId;
  }
};

const spotAssigned: Edit<'spotAssign'> = (draft, { spotId, person }) => {
  const spot = itemOf(draft.spots, spotId);
  if (spot === null) {
    return;
  }

  for (const otherId of idsOf(draft.spots)) {
    const other = itemOf(draft.spots, otherId);
    if (otherId !== spotId && person !== null && other?.person?.personId === person.personId) {
      other.person = null;
    }
  }
  spot.person = person;
};

const spotRemoved: Edit<'spotRemove'> = (draft, { spotId }) => {
  if (itemOf(draft.spots, spotId) === null) {
    return;
  }

  delete draft.spots[spotId];
  delete draft.tracks[spotId];
  draft.spotOrder = draft.spotOrder.filter((id) => id !== spotId);
};

const tracksSet: Edit<'tracks'> = (draft, { tracks }) => {
  for (const spotId of idsOf(tracks)) {
    const keyframes = itemOf(tracks, spotId);
    const known = itemOf(draft.tracks, spotId);
    if (
      keyframes !== null &&
      itemOf(draft.spots, spotId) !== null &&
      (known === null || !sameValue(known, keyframes))
    ) {
      draft.tracks[spotId] = keyframes.map((keyframe) => ({ ...keyframe }));
    }
  }
};

const songOrdered: Edit<'songOrder'> = (draft, { songIds }) => {
  const known = new Set(draft.songOrder);
  const listed = songIds.filter((songId) => known.has(songId));
  const missing = draft.songOrder.filter((songId) => !listed.includes(songId));

  draft.songOrder = [...listed, ...missing];
};

const songSet: Edit<'songSettings'> = (draft, change) => {
  const song = itemOf(draft.songs, change.songId);
  if (song !== null) {
    song.startSeconds = change.startSeconds;
    song.endSeconds = change.endSeconds;
    song.firstBeatSeconds = change.firstBeatSeconds;
    song.tempoBpm = change.tempoBpm;
  }
};

export const applyChange = (draft: Draft<StudioDocument>, change: StudioChange): void => {
  switch (change.kind) {
    case 'songOrder':
      songOrdered(draft, change);
      return;
    case 'songSettings':
      songSet(draft, change);
      return;
    case 'stepMark':
      stepMarked(draft, change);
      return;
    case 'stepMove':
      stepMoved(draft, change);
      return;
    case 'stepName':
      stepRenamed(draft, change);
      return;
    case 'stepRemove':
      stepRemoved(draft, change);
      return;
    case 'partAdd':
      partAdded(draft, change);
      return;
    case 'partSettings':
      partSet(draft, change);
      return;
    case 'partRemove': {
      delete draft.parts[change.partId];
      return;
    }
    case 'videoName': {
      const video = itemOf(draft.videos, change.videoId);
      if (video !== null) {
        video.name = change.name;
      }
      return;
    }
    case 'videoStart': {
      const video = itemOf(draft.videos, change.videoId);
      if (video !== null) {
        video.startSeconds = change.startSeconds;
      }
      return;
    }
    case 'videoClip': {
      const video = itemOf(draft.videos, change.videoId);
      if (video !== null) {
        video.clipStartSeconds = change.startSeconds;
        video.clipEndSeconds = change.endSeconds;
      }
      return;
    }
    case 'spotAdd': {
      if (itemOf(draft.spots, change.spotId) === null) {
        draft.spots[change.spotId] = { person: null };
        draft.spotOrder = [...draft.spotOrder, change.spotId];
      }
      return;
    }
    case 'spotRemove':
      spotRemoved(draft, change);
      return;
    case 'spotAssign':
      spotAssigned(draft, change);
      return;
    case 'tracks':
      tracksSet(draft, change);
      return;
  }
};

export const mergeKeyOf = (change: StudioChange): string | null => {
  switch (change.kind) {
    case 'songSettings':
      return `song:${change.songId}`;
    case 'stepMove':
      return `stepMove:${change.stepId}`;
    case 'stepName':
      return `stepName:${change.stepId}`;
    case 'partSettings':
      return `partSettings:${change.partId}`;
    case 'videoName':
      return `videoName:${change.videoId}`;
    case 'videoStart':
      return `videoStart:${change.videoId}`;
    case 'videoClip':
      return `videoClip:${change.videoId}`;
    case 'tracks':
      return `tracks:${idsOf(change.tracks)
        .sort((left, right) => left - right)
        .join(',')}`;
    default:
      return null;
  }
};
