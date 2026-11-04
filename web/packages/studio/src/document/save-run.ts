import type { Draft } from 'immer';
import { produce } from 'immer';
import type { CreatedCollection, IdMap } from './id-map';
import { serverIdOf, withLearnedId } from './id-map';
import type { SaveWrite } from './save-plan';
import type { SaveOutcome, ServerWrite } from './save-port';
import { applyChange } from './studio-changes';
import type { DocumentAlignment, StudioDocument } from './studio-document';
import { itemOf } from './studio-document';

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

      return partId === null || firstStepId === null ? null : { ...write, partId, firstStepId };
    }
    case 'partAdd':
      return resolvedOf(ids, 'steps', write.firstStepId, (firstStepId) => ({
        ...write,
        firstStepId,
      }));
    case 'stepRemove':
    case 'stepMove':
    case 'stepText':
      return resolvedOf(ids, 'steps', write.stepId, (stepId) => ({ ...write, stepId }));
    case 'tracks':
      return resolvedTracksOf(write, ids, choreographyVersion);
    default:
      return write;
  }
};

export interface LearnedIds {
  ids: IdMap;
  strayStepIds: readonly number[];
}

const stepIdsLearned = (
  write: Extract<SaveWrite, { kind: 'stepMark' }>,
  created: readonly number[],
  ids: IdMap,
): LearnedIds => {
  const marked = created.at(-1);
  if (marked === undefined) {
    return { ids, strayStepIds: [] };
  }

  const opening = write.openingStepId === null ? undefined : created.slice(0, -1)[0];
  const strays = created.slice(0, -1).filter((stepId) => stepId !== opening);
  const withMark = withLearnedId(ids, 'steps', write.stepId, marked);

  return {
    ids:
      opening === undefined || write.openingStepId === null
        ? withMark
        : withLearnedId(withMark, 'steps', write.openingStepId, opening),
    strayStepIds: strays,
  };
};

export const idsLearnedFrom = (write: SaveWrite, outcome: SaveOutcome, ids: IdMap): LearnedIds => {
  const created = outcome.kind === 'created' ? outcome.ids : [];
  const first = created[0];

  switch (write.kind) {
    case 'spotAdd':
      return {
        ids: first === undefined ? ids : withLearnedId(ids, 'spots', write.spotId, first),
        strayStepIds: [],
      };
    case 'partAdd':
      return {
        ids: first === undefined ? ids : withLearnedId(ids, 'parts', write.partId, first),
        strayStepIds: [],
      };
    case 'stepMark':
      return stepIdsLearned(write, created, ids);
    default:
      return { ids, strayStepIds: [] };
  }
};

const recordedAlignmentsOf = (
  saved: readonly DocumentAlignment[],
  target: readonly DocumentAlignment[],
  write: Extract<SaveWrite, { kind: 'finalOffset' }>,
): DocumentAlignment[] => {
  const wanted = new Set(target.map((entry) => entry.fromSeconds));

  return [
    ...saved
      .filter((entry) => entry.fromSeconds !== write.fromSeconds && wanted.has(entry.fromSeconds))
      .map((entry) => ({ ...entry })),
    { fromSeconds: write.fromSeconds, offsetSeconds: write.offsetSeconds, stretch: write.stretch },
  ].sort((left, right) => left.fromSeconds - right.fromSeconds);
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
    case 'finalBeat': {
      const track = itemOf(draft.finalTracks, write.finalTrackId);
      if (track !== null) {
        track.firstBeatSeconds = write.firstBeatSeconds;
        track.tempoBpm = write.tempoBpm;
      }
      return;
    }
    case 'finalOffset': {
      const track = itemOf(draft.finalTracks, write.finalTrackId);
      if (track !== null) {
        track.alignments[write.sourceMediaItemId] = recordedAlignmentsOf(
          itemOf(track.alignments, write.sourceMediaItemId) ?? [],
          itemOf(
            itemOf(target.finalTracks, write.finalTrackId)?.alignments ?? {},
            write.sourceMediaItemId,
          ) ?? [],
          write,
        );
      }
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
      applyChange(draft, { kind: 'stepRemove', stepId: write.stepId });
      return;
    case 'stepMove': {
      const step = itemOf(draft.steps, write.stepId);
      if (step !== null) {
        step.startSeconds = write.atSeconds;
      }
      return;
    }
    case 'stepMark': {
      draft.steps[write.stepId] = { startSeconds: write.atSeconds, name: '', description: null };
      if (write.openingStepId !== null) {
        draft.steps[write.openingStepId] = { startSeconds: 0, name: '', description: null };
      }
      return;
    }
    case 'stepText': {
      const step = itemOf(draft.steps, write.stepId);
      if (step !== null) {
        step.name = write.name;
        step.description = write.description;
      }
      return;
    }
    case 'partAdd': {
      draft.parts[write.partId] = {
        name: write.name,
        firstStepId: write.firstStepId,
        mainVideoId: null,
      };
      return;
    }
    case 'partSettings': {
      draft.parts[write.partId] = {
        name: write.name,
        firstStepId: write.firstStepId,
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
