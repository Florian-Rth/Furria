import type { Studio } from '../models/studio-schemas';

export type CreatedCollection = 'steps' | 'parts' | 'spots';

export type IdMap = Readonly<Record<CreatedCollection, ReadonlyMap<number, number>>>;

export const NO_IDS: IdMap = { steps: new Map(), parts: new Map(), spots: new Map() };

export const isLocalId = (id: number): boolean => id < 0;

export const serverIdOf = (ids: IdMap, collection: CreatedCollection, id: number): number | null =>
  ids[collection].get(id) ?? (isLocalId(id) ? null : id);

export const withLearnedId = (
  ids: IdMap,
  collection: CreatedCollection,
  localId: number,
  serverId: number,
): IdMap => ({ ...ids, [collection]: new Map([...ids[collection], [localId, serverId]]) });

type Rename = (id: number) => number;

const localOf =
  (ids: IdMap, collection: CreatedCollection): Rename =>
  (id) => {
    for (const [local, server] of ids[collection]) {
      if (server === id) {
        return local;
      }
    }

    return id;
  };

const serverOf =
  (ids: IdMap, collection: CreatedCollection): Rename =>
  (id) =>
    ids[collection].get(id) ?? id;

const renamedStudioOf = <TStudio extends Studio>(
  studio: TStudio,
  step: Rename,
  part: Rename,
  spot: Rename,
): TStudio => ({
  ...studio,
  steps: studio.steps.map((known) => ({ ...known, stepId: step(known.stepId) })),
  parts: studio.parts.map((known) => ({
    ...known,
    partId: part(known.partId),
    stepIds: known.stepIds.map(step),
  })),
  spots: studio.spots.map((known) => ({ ...known, spotId: spot(known.spotId) })),
  choreography:
    studio.choreography === null
      ? null
      : {
          ...studio.choreography,
          tracks: studio.choreography.tracks.map((track) => ({
            ...track,
            spotId: spot(track.spotId),
          })),
        },
});

export const localStudioOf = <TStudio extends Studio>(studio: TStudio, ids: IdMap): TStudio =>
  renamedStudioOf(studio, localOf(ids, 'steps'), localOf(ids, 'parts'), localOf(ids, 'spots'));

export const serverStudioOf = <TStudio extends Studio>(studio: TStudio, ids: IdMap): TStudio =>
  renamedStudioOf(studio, serverOf(ids, 'steps'), serverOf(ids, 'parts'), serverOf(ids, 'spots'));
