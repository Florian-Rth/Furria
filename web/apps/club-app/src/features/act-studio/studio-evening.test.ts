import type { Keyframe } from '@furria/studio/studio-schemas';
import type { SpotPerson } from '@furria/studio/studio-spots';
import { describe, expect, it } from 'vitest';
import type { ActStudio, StudioAppearance, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  EMPTY_APPEARANCE,
  eveningCastOf,
  eveningChangesOf,
  eveningChoreographyStateOf,
  eveningSavedOf,
  eveningStudioOf,
  eveningViewOf,
  withEveningDancer,
} from './studio-evening';

const person = (personId: number): SpotPerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'X',
  portrait: null,
});

const member = (personId: number): CastPerson => ({ ...person(personId), absent: false });

const keyframe = (seconds: number): Keyframe => ({
  sourceMediaItemId: 11,
  seconds,
  position: { rightMetres: 0, backMetres: 1 },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const evening = (appearance: StudioAppearance | null): StudioEvening => ({
  eventId: 5,
  title: 'Prunksitzung',
  startsAt: '2026-11-29T18:11:00+00:00',
  appearance,
});

const studioWith = (appearance: StudioAppearance | null): ActStudio => ({
  music: { lengthSeconds: 60, source: 'workingMix' },
  songs: [],
  finalTracks: [],
  steps: [],
  parts: [],
  videos: [],
  stage: null,
  spots: [
    { spotId: 1, number: 1, person: person(7) },
    { spotId: 2, number: 2, person: person(8) },
  ],
  choreography: { version: 4, tracks: [{ spotId: 1, keyframes: [keyframe(1)] }] },
  evenings: [evening(appearance)],
  trainings: [],
});

const appearanceOf = (
  response: { studio: ActStudio | null } | undefined,
): StudioAppearance | null => response?.studio?.evenings[0]?.appearance ?? null;

describe('eveningCastOf', () => {
  it('drops who sits the evening out and adds the stand-ins', () => {
    const cast = eveningCastOf([member(7), member(8)], {
      ...EMPTY_APPEARANCE,
      removedPersonIds: [8],
      added: [person(9)],
    });

    expect(cast.map((dancer) => dancer.personId)).toEqual([7, 9]);
  });
});

describe('eveningStudioOf', () => {
  it('shows the evening spots, leaves the spot of who sits out open and plays the copy', () => {
    const appearance: StudioAppearance = {
      ...EMPTY_APPEARANCE,
      removedPersonIds: [8],
      spotChanges: [{ spotId: 1, person: person(9) }],
      choreography: { version: 2, copiedFromVersion: 4, tracks: [] },
    };
    const studio = studioWith(appearance);

    const shown = eveningStudioOf(studio, eveningViewOf(studio, 5), evening(appearance), [
      member(7),
      member(9),
    ]);

    expect([
      shown.spots.map((spot) => spot.person?.personId ?? null),
      shown.choreography?.version,
    ]).toEqual([[9, null], 2]);
  });

  it('keeps the session outside an evening', () => {
    const studio = studioWith(null);

    expect(eveningStudioOf(studio, studio, null, [])).toBe(studio);
  });
});

describe('eveningSavedOf without an appearance', () => {
  it('leaves an evening the act has not joined alone when nothing differs', () => {
    const studio = studioWith(null);

    expect(eveningSavedOf(studio, 5, eveningViewOf(studio, 5), false)).toBe(studio);
  });
});

describe('eveningChoreographyStateOf', () => {
  it.each([
    [null, 'session'],
    [4, 'own'],
    [3, 'behind'],
  ] as const)('reads a copy made from version %s as %s', (copiedFrom, state) => {
    const appearance: StudioAppearance = {
      ...EMPTY_APPEARANCE,
      choreography:
        copiedFrom === null ? null : { version: 1, copiedFromVersion: copiedFrom, tracks: [] },
    };

    expect(eveningChoreographyStateOf(appearance, { version: 4, tracks: [] })).toBe(state);
  });
});

describe('eveningChangesOf', () => {
  it('names every kind of difference the evening holds', () => {
    expect(
      eveningChangesOf({
        ...EMPTY_APPEARANCE,
        added: [person(9)],
        choreography: { version: 1, copiedFromVersion: null, tracks: [] },
      }),
    ).toEqual(['cast', 'choreography']);
  });
});

describe('eveningSavedOf', () => {
  const saved = (studio: ActStudio, patch: Partial<ActStudio>): ActStudio => ({
    ...eveningViewOf(studio, 5),
    ...patch,
  });

  it('starts a copy from the session version once the formation was saved', () => {
    const studio = studioWith(null);

    const after = eveningSavedOf(
      studio,
      5,
      saved(studio, { choreography: { version: 1, tracks: [{ spotId: 2, keyframes: [] }] } }),
      true,
    );

    expect(after.evenings[0]?.appearance?.choreography).toEqual({
      version: 1,
      copiedFromVersion: 4,
      tracks: [{ spotId: 2, keyframes: [] }],
    });
  });

  it('stores only the spots that differ from the session and makes no copy for them', () => {
    const studio = studioWith(EMPTY_APPEARANCE);
    const view = eveningViewOf(studio, 5);

    const after = eveningSavedOf(
      studio,
      5,
      saved(studio, {
        spots: view.spots.map((spot) =>
          spot.spotId === 2 ? { ...spot, person: person(7) } : { ...spot, person: null },
        ),
      }),
      false,
    );

    expect([
      after.evenings[0]?.appearance?.spotChanges.map((change) => change.person?.personId ?? null),
      after.evenings[0]?.appearance?.choreography,
    ]).toEqual([[null, 7], null]);
  });

  it('carries the saved version onto an existing copy', () => {
    const studio = studioWith({
      ...EMPTY_APPEARANCE,
      choreography: { version: 2, copiedFromVersion: 4, tracks: [] },
    });

    const after = eveningSavedOf(
      studio,
      5,
      saved(studio, { choreography: { version: 3, tracks: [] } }),
      true,
    );

    expect(after.evenings[0]?.appearance?.choreography).toEqual({
      version: 3,
      copiedFromVersion: 4,
      tracks: [],
    });
  });
});

describe('withEveningDancer', () => {
  it.each([
    [7, false, [7], []],
    [7, true, [], []],
    [9, true, [], [9]],
    [9, false, [], []],
  ] as const)(
    'marks person %s dancing=%s as removed %j and added %j',
    (id, dances, removed, added) => {
      const after = withEveningDancer({ studio: studioWith(null) }, 5, [member(7), member(8)], {
        person: person(id),
        dances,
      });

      const appearance = appearanceOf(after);
      expect([
        appearance?.removedPersonIds,
        appearance?.added.map((standIn) => standIn.personId),
      ]).toEqual([removed, added]);
    },
  );
});
