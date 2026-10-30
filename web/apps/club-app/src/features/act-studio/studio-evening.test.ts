import { describe, expect, it } from 'vitest';
import type { Keyframe, Studio, StudioAppearance, StudioEvening } from '@/features/acts/schemas';
import type { CastPerson } from '@/features/running-order/schemas';
import {
  EMPTY_APPEARANCE,
  eveningCastOf,
  eveningChangesOf,
  eveningChoreographyStateOf,
  eveningStudioOf,
  withEveningCopyVersion,
  withEveningDancer,
  withEveningStudio,
} from './studio-evening';
import type { SpotPerson } from './studio-spots';
import { withChoreographyVersion, withSpotPerson, withTracks } from './studio-spots';

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

const studioWith = (appearance: StudioAppearance | null): Studio => ({
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
});

const appearanceOf = (response: { studio: Studio | null } | undefined): StudioAppearance | null =>
  response?.studio?.evenings[0]?.appearance ?? null;

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

    const shown = eveningStudioOf(studio, evening(appearance), [member(7), member(9)]);

    expect([
      shown.spots.map((spot) => spot.person?.personId ?? null),
      shown.choreography?.version,
    ]).toEqual([[9, null], 2]);
  });

  it('keeps the session when the act has no appearance that evening', () => {
    const studio = studioWith(null);

    expect(eveningStudioOf(studio, evening(null), [])).toBe(studio);
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

describe('withEveningStudio', () => {
  it('starts a copy from the session version on the first formation change', () => {
    const before = { studio: studioWith(null) };

    const after = withEveningStudio(
      before,
      5,
      (studio) => withTracks({ studio }, { 2: [keyframe(3)] })?.studio ?? studio,
    );

    const copy = appearanceOf(after)?.choreography;
    expect([copy?.version, copy?.copiedFromVersion, copy?.tracks.length]).toEqual([0, 4, 2]);
    expect(after?.studio.choreography?.tracks).toHaveLength(1);
  });

  it('stores only the spots that differ from the session', () => {
    const before = { studio: studioWith(EMPTY_APPEARANCE) };

    const after = withEveningStudio(
      before,
      5,
      (studio) => withSpotPerson({ studio }, { spotId: 2, person: person(7) })?.studio ?? studio,
    );

    expect(
      appearanceOf(after)?.spotChanges.map((change) => change.person?.personId ?? null),
    ).toEqual([null, 7]);
    expect(appearanceOf(after)?.choreography).toBeNull();
  });

  it('carries the saved version onto the copy', () => {
    const before = {
      studio: studioWith({
        ...EMPTY_APPEARANCE,
        choreography: { version: 0, copiedFromVersion: 4, tracks: [] },
      }),
    };

    const after = withEveningStudio(
      before,
      5,
      (studio) => withChoreographyVersion({ studio }, 1)?.studio ?? studio,
    );

    expect(appearanceOf(after)?.choreography).toEqual({
      version: 1,
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

describe('withEveningCopyVersion', () => {
  it('leaves an evening without a copy as it is', () => {
    const before = { studio: studioWith(EMPTY_APPEARANCE) };

    expect(appearanceOf(withEveningCopyVersion(before, 5, 3))?.choreography).toBeNull();
  });
});
