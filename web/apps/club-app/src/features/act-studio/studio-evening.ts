import type { Choreography, StudioSpot } from '@furria/studio/studio-schemas';
import type {
  ActStudio,
  EveningChoreography,
  StudioAppearance,
  StudioEvening,
  StudioSpotChange,
} from '@/features/acts/schemas';
import type { HoldsStudio } from '@/features/acts/studio-response';
import { withStudio } from '@/features/acts/studio-response';
import type { CastPerson, EveningChange } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';

export type EveningChoreographyState = 'session' | 'own' | 'behind';

export interface EveningDancer {
  person: PortraitPersonRef;
  dances: boolean;
}

export const EMPTY_APPEARANCE: StudioAppearance = {
  appearanceId: 0,
  position: null,
  added: [],
  removedPersonIds: [],
  spotChanges: [],
  choreography: null,
};

const personIdOf = (spot: { person: { personId: number } | null } | undefined): number | null =>
  spot?.person?.personId ?? null;

export const eveningSpotsOf = (
  spots: readonly StudioSpot[],
  changes: readonly StudioSpotChange[],
): StudioSpot[] =>
  spots.map((spot) => {
    const change = changes.find((candidate) => candidate.spotId === spot.spotId);

    return change === undefined ? spot : { ...spot, person: change.person };
  });

const appearanceOf = (studio: ActStudio, eventId: number): StudioAppearance | null =>
  studio.evenings.find((evening) => evening.eventId === eventId)?.appearance ?? null;

export const eveningViewOf = (studio: ActStudio, eventId: number): ActStudio => {
  const appearance = appearanceOf(studio, eventId) ?? EMPTY_APPEARANCE;

  return {
    ...studio,
    spots: eveningSpotsOf(studio.spots, appearance.spotChanges),
    choreography:
      appearance.choreography === null
        ? studio.choreography
        : { version: appearance.choreography.version, tracks: appearance.choreography.tracks },
  };
};

export const eveningCopyOf = (studio: ActStudio, eventId: number): EveningChoreography | null =>
  appearanceOf(studio, eventId)?.choreography ?? null;

export const eveningCastOf = (
  cast: readonly CastPerson[],
  appearance: StudioAppearance | null,
): CastPerson[] => {
  if (appearance === null) {
    return [...cast];
  }

  const removed = new Set(appearance.removedPersonIds);
  const standIns = appearance.added
    .filter((person) => !cast.some((member) => member.personId === person.personId))
    .map((person) => ({ ...person, absent: false }));

  return [...cast.filter((member) => !removed.has(member.personId)), ...standIns];
};

export const eveningStudioOf = (
  session: ActStudio,
  stage: ActStudio,
  evening: StudioEvening | null,
  cast: readonly CastPerson[],
): ActStudio => {
  if (evening === null) {
    return session;
  }

  const dancing = new Set(cast.map((person) => person.personId));
  const sitsOut = (spot: StudioSpot): boolean =>
    evening.appearance !== null && spot.person !== null && !dancing.has(spot.person.personId);

  return {
    ...session,
    spots: stage.spots.map((spot) => (sitsOut(spot) ? { ...spot, person: null } : spot)),
    choreography: stage.choreography,
  };
};

export const eveningChoreographyStateOf = (
  appearance: StudioAppearance | null,
  session: Choreography | null,
): EveningChoreographyState => {
  const copy = appearance?.choreography ?? null;
  if (copy === null) {
    return 'session';
  }

  return copy.copiedFromVersion === (session?.version ?? null) ? 'own' : 'behind';
};

export const eveningChangesOf = (appearance: StudioAppearance | null): EveningChange[] => {
  if (appearance === null) {
    return [];
  }

  const made: [EveningChange, boolean][] = [
    ['cast', appearance.removedPersonIds.length + appearance.added.length > 0],
    ['spots', appearance.spotChanges.length > 0],
    ['choreography', appearance.choreography !== null],
  ];

  return made.filter(([, changed]) => changed).map(([change]) => change);
};

const spotChangesOf = (
  session: readonly StudioSpot[],
  evening: readonly StudioSpot[],
): StudioSpotChange[] =>
  evening
    .filter(
      (spot) =>
        personIdOf(session.find((candidate) => candidate.spotId === spot.spotId)) !==
        personIdOf(spot),
    )
    .map((spot) => ({ spotId: spot.spotId, person: spot.person }));

const withAppearance = (
  studio: ActStudio,
  eventId: number,
  change: (appearance: StudioAppearance) => StudioAppearance,
): ActStudio => ({
  ...studio,
  evenings: studio.evenings.map((evening) =>
    evening.eventId === eventId
      ? { ...evening, appearance: change(evening.appearance ?? EMPTY_APPEARANCE) }
      : evening,
  ),
});

const savedCopyOf = (
  studio: ActStudio,
  appearance: StudioAppearance,
  saved: Choreography | null,
  copied: boolean,
): EveningChoreography | null => {
  const copy = appearance.choreography;
  if (saved === null || !copied) {
    return copy;
  }

  return copy === null
    ? { ...saved, copiedFromVersion: studio.choreography?.version ?? null }
    : { ...copy, version: saved.version, tracks: saved.tracks };
};

export const eveningSavedOf = (
  studio: ActStudio,
  eventId: number,
  saved: ActStudio,
  copied: boolean,
): ActStudio => {
  const appearance = appearanceOf(studio, eventId);
  const spotChanges = spotChangesOf(studio.spots, saved.spots);
  const choreography = savedCopyOf(
    studio,
    appearance ?? EMPTY_APPEARANCE,
    saved.choreography,
    copied,
  );
  if (appearance === null && spotChanges.length === 0 && choreography === null) {
    return studio;
  }

  return withAppearance(studio, eventId, (current) => ({
    ...current,
    spotChanges,
    choreography,
  }));
};

export const withEveningDancer = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
  sessionCast: readonly { personId: number }[],
  { person, dances }: EveningDancer,
): TResponse | undefined =>
  withStudio(response, (studio) =>
    withAppearance(studio, eventId, (appearance) => {
      const inSession = sessionCast.some((member) => member.personId === person.personId);
      const removed = appearance.removedPersonIds.filter((id) => id !== person.personId);
      const added = appearance.added.filter((member) => member.personId !== person.personId);

      return {
        ...appearance,
        removedPersonIds: inSession && !dances ? [...removed, person.personId] : removed,
        added: !inSession && dances ? [...added, person] : added,
      };
    }),
  );

export const withEveningJoined = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => withAppearance(studio, eventId, (appearance) => appearance));
