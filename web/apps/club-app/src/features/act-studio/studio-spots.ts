import type { Choreography, Keyframe, StudioSpot } from '@/features/acts/schemas';
import type { HoldsStudio } from './studio-music';
import { withStudio } from './studio-music';

const NO_CHOREOGRAPHY_VERSION = 0;

export type SpotPerson = NonNullable<StudioSpot['person']>;
export type TrackChanges = Readonly<Record<number, readonly Keyframe[]>>;

export const changedTracksOf = (changes: TrackChanges): Choreography['tracks'] =>
  Object.entries(changes).map(([spotId, keyframes]) => ({
    spotId: Number(spotId),
    keyframes: [...keyframes],
  }));

export interface SpotAssignment {
  spotId: number;
  person: SpotPerson | null;
}

export const withTracks = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  changes: TrackChanges,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const current = studio.choreography;
    const changed = new Set(Object.keys(changes).map(Number));
    const kept = (current?.tracks ?? []).filter((track) => !changed.has(track.spotId));
    const added = [...changed].map((spotId) => ({
      spotId,
      keyframes: [...(changes[spotId] ?? [])],
    }));

    return {
      ...studio,
      choreography: {
        version: current?.version ?? NO_CHOREOGRAPHY_VERSION,
        tracks: [...kept, ...added],
      },
    };
  });

export const withChoreographyVersion = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  version: number,
): TResponse | undefined =>
  withStudio(response, (studio) =>
    studio.choreography === null
      ? studio
      : { ...studio, choreography: { ...studio.choreography, version } },
  );

export const withSpotAdded = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  spot: { spotId: number; number: number },
): TResponse | undefined =>
  withStudio(response, (studio) =>
    studio.spots.some((known) => known.spotId === spot.spotId)
      ? studio
      : { ...studio, spots: [...studio.spots, { ...spot, person: null }] },
  );

export const withSpotPerson = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { spotId, person }: SpotAssignment,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    spots: studio.spots.map((spot) => {
      if (spot.spotId === spotId) {
        return { ...spot, person };
      }

      return person !== null && spot.person?.personId === person.personId
        ? { ...spot, person: null }
        : spot;
    }),
  }));

export const withoutSpot = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  spotId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const removed = studio.spots.find((spot) => spot.spotId === spotId);
    if (removed === undefined) {
      return studio;
    }

    return {
      ...studio,
      spots: studio.spots
        .filter((spot) => spot.spotId !== spotId)
        .map((spot) =>
          spot.number > removed.number ? { ...spot, number: spot.number - 1 } : spot,
        ),
      choreography:
        studio.choreography === null
          ? null
          : {
              ...studio.choreography,
              tracks: studio.choreography.tracks.filter((track) => track.spotId !== spotId),
            },
    };
  });
