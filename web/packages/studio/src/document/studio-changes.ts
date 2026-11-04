import type { Draft } from 'immer';
import type { Keyframe, StudioPerson } from '../models/studio-schemas';
import { stepBordersOf, timelineStepsOf } from './document-projection';
import { sameValue } from './same-value';
import type { DocumentSong, StudioDocument } from './studio-document';
import { idsOf, itemOf } from './studio-document';

const BORDER_TOLERANCE_SECONDS = 0.01;

export type StudioChange =
  | { kind: 'songOrder'; songIds: readonly number[] }
  | ({ kind: 'songSettings'; songId: number } & DocumentSong)
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
      untilSeconds: number;
      offsetSeconds: number;
      stretch: number;
    }
  | {
      kind: 'stepMark';
      stepId: number;
      openingStepId: number;
      atSeconds: number;
      lengthSeconds: number;
    }
  | { kind: 'stepMove'; stepId: number; atSeconds: number; lengthSeconds: number }
  | { kind: 'stepText'; stepId: number; name: string; description: string | null }
  | { kind: 'stepRemove'; stepId: number }
  | { kind: 'partAdd'; partId: number; firstStepId: number; name: string }
  | {
      kind: 'partSettings';
      partId: number;
      name: string;
      firstStepId: number;
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

const liesOnABorder = (document: StudioDocument, seconds: number): boolean =>
  stepBordersOf(document).some(
    (step) => Math.abs(step.startSeconds - seconds) < BORDER_TOLERANCE_SECONDS,
  );

const insideTheMusic = (seconds: number, lengthSeconds: number): boolean =>
  seconds >= 0 && seconds < lengthSeconds;

const stepMarked: Edit<'stepMark'> = (
  draft,
  { stepId, openingStepId, atSeconds, lengthSeconds },
) => {
  if (
    !insideTheMusic(atSeconds, lengthSeconds) ||
    itemOf(draft.steps, stepId) !== null ||
    liesOnABorder(draft, atSeconds)
  ) {
    return;
  }

  if (timelineStepsOf(draft).length === 0 && atSeconds > BORDER_TOLERANCE_SECONDS) {
    draft.steps[openingStepId] = { startSeconds: 0, name: '', description: null };
  }
  draft.steps[stepId] = { startSeconds: atSeconds, name: '', description: null };
};

const stepMoved: Edit<'stepMove'> = (draft, { stepId, atSeconds, lengthSeconds }) => {
  const borders = stepBordersOf(draft);
  const index = borders.findIndex((step) => step.stepId === stepId);
  const before = borders[index - 1];
  const after = borders[index + 1];
  const step = itemOf(draft.steps, stepId);
  const fits =
    before !== undefined &&
    atSeconds > before.startSeconds + BORDER_TOLERANCE_SECONDS &&
    atSeconds < (after?.startSeconds ?? lengthSeconds) - BORDER_TOLERANCE_SECONDS;

  if (step !== null && fits) {
    step.startSeconds = atSeconds;
  }
};

const stepTexted: Edit<'stepText'> = (draft, { stepId, name, description }) => {
  const step = itemOf(draft.steps, stepId);
  if (step !== null) {
    step.name = name;
    step.description = description;
  }
};

const partStartsOf = (document: StudioDocument): Set<number> =>
  new Set(
    idsOf(document.parts).flatMap((partId) => {
      const firstStepId = itemOf(document.parts, partId)?.firstStepId ?? null;

      return firstStepId === null ? [] : [firstStepId];
    }),
  );

const stepRemoved: Edit<'stepRemove'> = (draft, { stepId }) => {
  if (itemOf(draft.steps, stepId) === null) {
    return;
  }

  const order = timelineStepsOf(draft).map((step) => step.stepId);
  const index = order.indexOf(stepId);
  const next = index < 0 ? undefined : order[index + 1];
  const heir = next !== undefined && !partStartsOf(draft).has(next) ? next : null;

  for (const partId of idsOf(draft.parts)) {
    const part = itemOf(draft.parts, partId);
    if (part?.firstStepId === stepId) {
      if (heir === null) {
        delete draft.parts[partId];
      } else {
        part.firstStepId = heir;
      }
    }
  }
  delete draft.steps[stepId];
};

const partAdded: Edit<'partAdd'> = (draft, { partId, firstStepId, name }) => {
  if (
    itemOf(draft.parts, partId) === null &&
    itemOf(draft.steps, firstStepId) !== null &&
    !partStartsOf(draft).has(firstStepId)
  ) {
    draft.parts[partId] = { name, firstStepId, mainVideoId: null };
  }
};

const partStartIndexesOf = (document: StudioDocument, order: readonly number[]): number[] =>
  [...partStartsOf(document)]
    .map((stepId) => order.indexOf(stepId))
    .filter((index) => index >= 0)
    .sort((left, right) => left - right);

const partStartFits = (
  document: StudioDocument,
  currentStepId: number | null,
  wantedStepId: number,
): boolean => {
  const order = timelineStepsOf(document).map((step) => step.stepId);
  const starts = partStartIndexesOf(document, order);
  const current = currentStepId === null ? -1 : order.indexOf(currentStepId);
  const wanted = order.indexOf(wantedStepId);
  const at = starts.indexOf(current);
  const lower = starts[at - 1];
  const upper = starts[at + 1] ?? order.length;

  return at > 0 && lower !== undefined && wanted > lower && wanted < upper;
};

const partSet: Edit<'partSettings'> = (draft, { partId, name, firstStepId, mainVideoId }) => {
  const part = itemOf(draft.parts, partId);
  if (part === null) {
    return;
  }

  part.name = name;
  part.mainVideoId = mainVideoId;
  if (part.firstStepId !== firstStepId && partStartFits(draft, part.firstStepId, firstStepId)) {
    part.firstStepId = firstStepId;
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
    song.pieces = change.pieces.map((piece) => ({ ...piece }));
    song.firstBeatSeconds = change.firstBeatSeconds;
    song.tempoBpm = change.tempoBpm;
  }
};

const finalBeatSet: Edit<'finalBeat'> = (draft, { finalTrackId, firstBeatSeconds, tempoBpm }) => {
  const track = itemOf(draft.finalTracks, finalTrackId);
  if (track !== null) {
    track.firstBeatSeconds = firstBeatSeconds;
    track.tempoBpm = tempoBpm;
  }
};

const finalOffsetSet: Edit<'finalOffset'> = (
  draft,
  { finalTrackId, sourceMediaItemId, fromSeconds, untilSeconds, offsetSeconds, stretch },
) => {
  const track = itemOf(draft.finalTracks, finalTrackId);
  if (track === null) {
    return;
  }

  const kept = (itemOf(track.alignments, sourceMediaItemId) ?? []).filter(
    (entry) =>
      entry.fromSeconds !== fromSeconds &&
      (entry.fromSeconds < fromSeconds || entry.fromSeconds >= untilSeconds),
  );
  track.alignments[sourceMediaItemId] = [
    ...kept.map((entry) => ({ ...entry })),
    { fromSeconds, offsetSeconds, stretch },
  ].sort((left, right) => left.fromSeconds - right.fromSeconds);
};

export const applyChange = (draft: Draft<StudioDocument>, change: StudioChange): void => {
  switch (change.kind) {
    case 'songOrder':
      songOrdered(draft, change);
      return;
    case 'songSettings':
      songSet(draft, change);
      return;
    case 'finalBeat':
      finalBeatSet(draft, change);
      return;
    case 'finalOffset':
      finalOffsetSet(draft, change);
      return;
    case 'stepMark':
      stepMarked(draft, change);
      return;
    case 'stepMove':
      stepMoved(draft, change);
      return;
    case 'stepText':
      stepTexted(draft, change);
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
    case 'finalBeat':
      return `finalBeat:${change.finalTrackId}`;
    case 'finalOffset':
      return `finalOffset:${change.finalTrackId}:${change.sourceMediaItemId}:${change.fromSeconds}`;
    case 'stepMove':
      return `stepMove:${change.stepId}`;
    case 'stepText':
      return `stepText:${change.stepId}`;
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
