import type {
  Choreography,
  EveningChoreography,
  Studio,
  StudioAppearance,
  StudioEvening,
  StudioSpot,
  StudioSpotChange,
} from '@/features/acts/schemas';
import type { CastPerson, EveningChange } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { HoldsStudio } from './studio-music';
import { withStudio } from './studio-music';

export type EveningChoreographyState = 'session' | 'own' | 'behind';

export interface EveningDancer {
  person: PortraitPersonRef;
  dances: boolean;
}

const UNSAVED_COPY_VERSION = 0;

export const EMPTY_APPEARANCE: StudioAppearance = {
  appearanceId: 0,
  position: null,
  stageStartsAt: null,
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

const eveningViewOf = (studio: Studio, appearance: StudioAppearance): Studio => ({
  ...studio,
  spots: eveningSpotsOf(studio.spots, appearance.spotChanges),
  choreography:
    appearance.choreography === null
      ? studio.choreography
      : { version: appearance.choreography.version, tracks: appearance.choreography.tracks },
});

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
  studio: Studio,
  evening: StudioEvening | null,
  cast: readonly CastPerson[],
): Studio => {
  const appearance = evening?.appearance ?? null;
  if (appearance === null) {
    return studio;
  }

  const dancing = new Set(cast.map((person) => person.personId));
  const view = eveningViewOf(studio, appearance);

  return {
    ...view,
    spots: view.spots.map((spot) =>
      spot.person === null || dancing.has(spot.person.personId) ? spot : { ...spot, person: null },
    ),
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

const copyOf = (
  before: EveningChoreography | null,
  session: Choreography | null,
  next: Choreography,
): EveningChoreography =>
  before === null
    ? {
        version: UNSAVED_COPY_VERSION,
        tracks: next.tracks,
        copiedFromVersion: session?.version ?? null,
      }
    : { ...before, version: next.version, tracks: next.tracks };

const withAppearance = (
  studio: Studio,
  eventId: number,
  change: (appearance: StudioAppearance) => StudioAppearance,
): Studio => ({
  ...studio,
  evenings: studio.evenings.map((evening) =>
    evening.eventId === eventId
      ? { ...evening, appearance: change(evening.appearance ?? EMPTY_APPEARANCE) }
      : evening,
  ),
});

export const withEveningStudio = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
  change: (studio: Studio) => Studio,
): TResponse | undefined =>
  withStudio(response, (studio) => {
    const evening = studio.evenings.find((candidate) => candidate.eventId === eventId);
    if (evening === undefined) {
      return studio;
    }

    const appearance = evening.appearance ?? EMPTY_APPEARANCE;
    const view = eveningViewOf(studio, appearance);
    const next = change(view);
    const choreography =
      next.choreography === view.choreography || next.choreography === null
        ? appearance.choreography
        : copyOf(appearance.choreography, studio.choreography, next.choreography);

    return withAppearance(studio, eventId, () => ({
      ...appearance,
      spotChanges: spotChangesOf(studio.spots, next.spots),
      choreography,
    }));
  });

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

export const withoutEveningCopy = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
): TResponse | undefined =>
  withStudio(response, (studio) =>
    withAppearance(studio, eventId, (appearance) => ({ ...appearance, choreography: null })),
  );

export const withEveningJoined = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => withAppearance(studio, eventId, (appearance) => appearance));

export const withEveningLeft = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    evenings: studio.evenings.map((evening) =>
      evening.eventId === eventId ? { ...evening, appearance: null } : evening,
    ),
  }));

export const withEveningCopyVersion = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  eventId: number,
  version: number,
): TResponse | undefined =>
  withStudio(response, (studio) =>
    withAppearance(studio, eventId, (appearance) =>
      appearance.choreography === null
        ? appearance
        : { ...appearance, choreography: { ...appearance.choreography, version } },
    ),
  );
