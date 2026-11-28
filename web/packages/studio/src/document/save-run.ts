import type { Draft } from 'immer';
import { produce } from 'immer';
import { splitsTheTailOf } from '../models/step-borders';
import type { CreatedCollection, IdMap } from './id-map';
import { serverIdOf, withLearnedId } from './id-map';
import type { SaveWrite } from './save-plan';
import type { SaveOutcome, ServerWrite } from './save-port';
import { applyChange, dropStep } from './studio-changes';
import type { StudioDocument } from './studio-document';
import { idsOf, itemOf } from './studio-document';

const resolvedOf = (
  ids: IdMap,
  collection: CreatedCollection,
  id: number,
  build: (serverId: number) => ServerWrite,
): ServerWrite | null => {
  const serverId = serverIdOf(ids, collection, id);

  return serverId === null ? null : build(serverId);
};

const resolvedTracksOf = (
  write: Extract<SaveWrite, { kind: 'tracks' }>,
  ids: IdMap,
  baseVersion: number | null,
): ServerWrite | null => {
  const tracks = write.tracks.flatMap((track) => {
    const spotId = serverIdOf(ids, 'spots', track.spotId);

    return spotId === null ? [] : [{ spotId, keyframes: track.keyframes }];
  });

  return tracks.length === 0 ? null : { kind: 'tracks', baseVersion, tracks };
};

export const serverWriteOf = (
  write: SaveWrite,
  ids: IdMap,
  choreographyVersion: number | null,
): ServerWrite | null => {
  switch (write.kind) {
    case 'spotRemove':
    case 'spotAssign':
      return resolvedOf(ids, 'spots', write.spotId, (spotId) => ({ ...write, spotId }));
    case 'partRemove':
      return resolvedOf(ids, 'parts', write.partId, (partId) => ({ ...write, partId }));
    case 'partSettings': {
      const partId = serverIdOf(ids, 'parts', write.partId);
      const firstStepId = serverIdOf(ids, 'steps', write.firstStepId);
      const lastStepId = serverIdOf(ids, 'steps', write.lastStepId);

      return partId === null || firstStepId === null || lastStepId === null
        ? null
        : { ...write, partId, firstStepId, lastStepId };
    }
    case 'partAdd': {
      const firstStepId = serverIdOf(ids, 'steps', write.firstStepId);
      const lastStepId = serverIdOf(ids, 'steps', write.lastStepId);

      return firstStepId === null || lastStepId === null
        ? null
        : { ...write, firstStepId, lastStepId };
    }
    case 'stepRemove':
    case 'stepStart':
    case 'stepEnd':
    case 'stepName':
      return resolvedOf(ids, 'steps', write.stepId, (stepId) => ({ ...write, stepId }));
    case 'tracks':
      return resolvedTracksOf(write, ids, choreographyVersion);
    default:
      return write;
  }
};

export const idsLearnedFrom = (write: SaveWrite, outcome: SaveOutcome, ids: IdMap): IdMap => {
  const first = outcome.kind === 'created' ? outcome.ids[0] : undefined;
  if (first === undefined) {
    return ids;
  }

  switch (write.kind) {
    case 'spotAdd':
      return withLearnedId(ids, 'spots', write.spotId, first);
    case 'partAdd':
      return withLearnedId(ids, 'parts', write.partId, first);
    case 'stepAdd':
      return withLearnedId(ids, 'steps', write.stepId, first);
    default:
      return ids;
  }
};

const splitOwnerIdOf = (
  draft: Draft<StudioDocument>,
  write: Extract<SaveWrite, { kind: 'stepAdd' }>,
): number | null => {
  const added = { start: write.startSeconds, end: write.endSeconds };

  return (
    idsOf(draft.steps).find((stepId) => {
      const step = itemOf(draft.steps, stepId);

      return (
        step !== null &&
        step.startSeconds !== null &&
        step.endSeconds !== null &&
        splitsTheTailOf({ start: step.startSeconds, end: step.endSeconds }, added)
      );
    }) ?? null
  );
};

const stepAdded = (
  draft: Draft<StudioDocument>,
  write: Extract<SaveWrite, { kind: 'stepAdd' }>,
): void => {
  const ownerId = splitOwnerIdOf(draft, write);
  const owner = ownerId === null ? null : itemOf(draft.steps, ownerId);
  if (owner !== null) {
    owner.endSeconds = write.startSeconds;
    for (const partId of idsOf(draft.parts)) {
      const part = itemOf(draft.parts, partId);
      if (part !== null && part.lastStepId === ownerId) {
        part.lastStepId = write.stepId;
      }
    }
  }
  draft.steps[write.stepId] = {
    startSeconds: write.startSeconds,
    endSeconds: write.endSeconds,
    name: '',
  };
};

const recorded = (draft: Draft<StudioDocument>, target: StudioDocument, write: SaveWrite): void => {
  switch (write.kind) {
    case 'songOrder':
      draft.songOrder = [...target.songOrder];
      return;
    case 'songSettings': {
      draft.songs[write.songId] = { ...write.settings };
      return;
    }
    case 'spotRemove':
      applyChange(draft, { kind: 'spotRemove', spotId: write.spotId });
      return;
    case 'spotAdd': {
      draft.spots[write.spotId] = { person: null };
      draft.spotOrder = target.spotOrder.filter((spotId) => itemOf(draft.spots, spotId) !== null);
      return;
    }
    case 'spotAssign':
      applyChange(draft, {
        kind: 'spotAssign',
        spotId: write.spotId,
        person: itemOf(target.spots, write.spotId)?.person ?? null,
      });
      return;
    case 'partRemove': {
      delete draft.parts[write.partId];
      return;
    }
    case 'stepRemove':
      dropStep(draft, write.stepId);
      return;
    case 'stepStart': {
      const step = itemOf(draft.steps, write.stepId);
      if (step !== null) {
        step.startSeconds = write.atSeconds;
      }
      return;
    }
    case 'stepEnd': {
      const step = itemOf(draft.steps, write.stepId);
      if (step !== null) {
        step.endSeconds = write.atSeconds;
      }
      return;
    }
    case 'stepAdd':
      stepAdded(draft, write);
      return;
    case 'stepName': {
      const step = itemOf(draft.steps, write.stepId);
      if (step !== null) {
        step.name = write.name;
      }
      return;
    }
    case 'partAdd': {
      draft.parts[write.partId] = {
        name: write.name,
        firstStepId: write.firstStepId,
        lastStepId: write.lastStepId,
        mainVideoId: null,
      };
      return;
    }
    case 'partSettings': {
      draft.parts[write.partId] = {
        name: write.name,
        firstStepId: write.firstStepId,
        lastStepId: write.lastStepId,
        mainVideoId: write.mainVideoId,
      };
      return;
    }
    case 'videoName': {
      const video = itemOf(draft.videos, write.videoId);
      if (video !== null) {
        video.name = write.name;
      }
      return;
    }
    case 'videoStart': {
      const video = itemOf(draft.videos, write.videoId);
      if (video !== null) {
        video.startSeconds = write.startSeconds;
      }
      return;
    }
    case 'videoClip': {
      const video = itemOf(draft.videos, write.videoId);
      if (video !== null) {
        video.clipStartSeconds = write.startSeconds;
        video.clipEndSeconds = write.endSeconds;
      }
      return;
    }
    case 'tracks': {
      for (const track of write.tracks) {
        draft.tracks[track.spotId] = [...track.keyframes];
      }
      return;
    }
  }
};

export const savedAfter = (
  saved: StudioDocument,
  target: StudioDocument,
  write: SaveWrite,
): StudioDocument =>
  produce(saved, (draft) => {
    recorded(draft, target, write);
  });
