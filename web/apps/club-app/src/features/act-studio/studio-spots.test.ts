import { describe, expect, it } from 'vitest';
import type { Keyframe, Studio } from '@/features/acts/schemas';
import type { SpotPerson } from './studio-spots';
import { withoutSpot, withSpotPerson, withTracks } from './studio-spots';

const person = (personId: number): SpotPerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'X',
  portrait: null,
});

const keyframe = (seconds: number): Keyframe => ({
  sourceMediaItemId: 11,
  seconds,
  position: { rightMetres: 0, backMetres: 1 },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const response = (studio: Pick<Studio, 'spots' | 'choreography'>): { studio: Studio } => ({
  studio: {
    music: { lengthSeconds: 60, source: 'workingMix' as const },
    songs: [],
    finalTracks: [],
    steps: [],
    parts: [],
    videos: [],
    stage: null,
    evenings: [],
    ...studio,
  },
});

describe('withSpotPerson', () => {
  it('takes the person off their old spot when they get another one', () => {
    const before = response({
      spots: [
        { spotId: 1, number: 1, person: person(7) },
        { spotId: 2, number: 2, person: null },
      ],
      choreography: null,
    });

    const after = withSpotPerson(before, { spotId: 2, person: person(7) });

    expect(after?.studio.spots.map((spot) => spot.person?.personId ?? null)).toEqual([null, 7]);
  });
});

describe('withoutSpot', () => {
  it('closes the number gap and drops the track of the removed spot', () => {
    const before = response({
      spots: [
        { spotId: 1, number: 1, person: null },
        { spotId: 2, number: 2, person: null },
        { spotId: 3, number: 3, person: null },
      ],
      choreography: {
        version: 4,
        tracks: [
          { spotId: 2, keyframes: [keyframe(1)] },
          { spotId: 3, keyframes: [keyframe(1)] },
        ],
      },
    });

    const after = withoutSpot(before, 2);

    expect([
      after?.studio.spots.map((spot) => [spot.spotId, spot.number]),
      after?.studio.choreography?.tracks.map((track) => track.spotId),
    ]).toEqual([
      [
        [1, 1],
        [3, 2],
      ],
      [3],
    ]);
  });
});

describe('withTracks', () => {
  it('replaces the changed tracks, keeps the rest and starts a missing choreography', () => {
    const before = response({
      spots: [],
      choreography: { version: 2, tracks: [{ spotId: 1, keyframes: [keyframe(1)] }] },
    });

    expect(withTracks(before, { 2: [keyframe(3)] })?.studio.choreography).toEqual({
      version: 2,
      tracks: [
        { spotId: 1, keyframes: [keyframe(1)] },
        { spotId: 2, keyframes: [keyframe(3)] },
      ],
    });
    expect(
      withTracks(response({ spots: [], choreography: null }), { 1: [keyframe(5)] })?.studio
        .choreography,
    ).toEqual({ version: 0, tracks: [{ spotId: 1, keyframes: [keyframe(5)] }] });
  });
});
