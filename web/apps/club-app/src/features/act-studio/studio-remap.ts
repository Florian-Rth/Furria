import type { TrackChanges } from './studio-spots';
import type { PartSettings } from './studio-steps';
import type { PartBinding, StudioWrite } from './studio-undo';

export type StudioEntity = 'song' | 'step' | 'part' | 'video' | 'spot' | 'finalTrack';

export interface IdRename {
  entity: StudioEntity;
  renames: ReadonlyMap<number, number>;
}

interface RemovedIds {
  entity: StudioEntity;
  ids: readonly number[];
}

export const removedIdsOf = (write: StudioWrite): RemovedIds | null => {
  switch (write.kind) {
    case 'songRemove':
      return { entity: 'song', ids: [write.songId] };
    case 'stepsRemove':
      return { entity: 'step', ids: write.stepIds };
    case 'partRemove':
      return { entity: 'part', ids: [write.partId] };
    case 'videoRemove':
      return { entity: 'video', ids: [write.videoId] };
    case 'spotRemove':
      return { entity: 'spot', ids: [write.spotId] };
    case 'finalRemove':
      return { entity: 'finalTrack', ids: [write.finalTrackId] };
    default:
      return null;
  }
};

export const renameOf = (applied: StudioWrite, created: readonly number[]): IdRename | null => {
  const removed = removedIdsOf(applied);
  if (removed === null || removed.ids.length === 0 || removed.ids.length !== created.length) {
    return null;
  }

  return {
    entity: removed.entity,
    renames: new Map(removed.ids.map((id, index) => [id, created[index] ?? id])),
  };
};

const renamed = (rename: IdRename, entity: StudioEntity, id: number): number =>
  rename.entity === entity ? (rename.renames.get(id) ?? id) : id;

const renamedOrNull = (rename: IdRename, entity: StudioEntity, id: number | null): number | null =>
  id === null ? null : renamed(rename, entity, id);

const settingsRenamed = (rename: IdRename, settings: PartSettings): PartSettings => ({
  ...settings,
  firstStepId: renamed(rename, 'step', settings.firstStepId),
  mainVideoId: renamedOrNull(rename, 'video', settings.mainVideoId),
});

const changesRenamed = (rename: IdRename, changes: TrackChanges): TrackChanges =>
  Object.fromEntries(
    Object.entries(changes).map(([spotId, keyframes]) => [
      renamed(rename, 'spot', Number(spotId)),
      keyframes,
    ]),
  );

const bindingRenamed = (rename: IdRename, binding: PartBinding): PartBinding => ({
  partId: renamed(rename, 'part', binding.partId),
  settings: settingsRenamed(rename, binding.settings),
});

export const writeRenamed = (rename: IdRename, write: StudioWrite): StudioWrite => {
  switch (write.kind) {
    case 'songRemove':
    case 'songSettings':
      return { ...write, songId: renamed(rename, 'song', write.songId) };
    case 'songOrder':
      return { ...write, songIds: write.songIds.map((id) => renamed(rename, 'song', id)) };
    case 'songRestore':
      return { ...write, order: write.order.map((id) => renamed(rename, 'song', id)) };
    case 'finalRemove':
    case 'finalBeat':
    case 'finalOffsets':
    case 'finalMatch':
    case 'finalAdopt':
      return { ...write, finalTrackId: renamed(rename, 'finalTrack', write.finalTrackId) };
    case 'stepsRemove':
      return { ...write, stepIds: write.stepIds.map((id) => renamed(rename, 'step', id)) };
    case 'stepText':
    case 'stepStart':
      return { ...write, stepId: renamed(rename, 'step', write.stepId) };
    case 'partAdd':
      return { ...write, firstStepId: renamed(rename, 'step', write.firstStepId) };
    case 'partRemove':
      return { ...write, partId: renamed(rename, 'part', write.partId) };
    case 'partRestore':
      return { ...write, settings: settingsRenamed(rename, write.settings) };
    case 'partSettings':
      return {
        ...write,
        partId: renamed(rename, 'part', write.partId),
        settings: settingsRenamed(rename, write.settings),
      };
    case 'videoRemove':
    case 'videoName':
    case 'videoStart':
    case 'videoAlign':
      return { ...write, videoId: renamed(rename, 'video', write.videoId) };
    case 'videoRestore':
      return { ...write, parts: write.parts.map((binding) => bindingRenamed(rename, binding)) };
    case 'spotRemove':
    case 'spotAssign':
    case 'eveningSpot':
      return { ...write, spotId: renamed(rename, 'spot', write.spotId) };
    case 'tracks':
    case 'eveningTracks':
      return { ...write, changes: changesRenamed(rename, write.changes) };
    case 'batch':
      return { ...write, writes: write.writes.map((part) => writeRenamed(rename, part)) };
    default:
      return write;
  }
};
