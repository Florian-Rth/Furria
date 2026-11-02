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

const localOf =
  (ids: IdMap, collection: CreatedCollection): ((id: number) => number) =>
  (id) => {
    for (const [local, server] of ids[collection]) {
      if (server === id) {
        return local;
      }
    }

    return id;
  };

export const localStudioOf = (studio: Studio, ids: IdMap): Studio => {
  const step = localOf(ids, 'steps');
  const part = localOf(ids, 'parts');
  const spot = localOf(ids, 'spots');

  return {
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
  };
};
