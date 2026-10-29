import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioSpot } from '@/features/acts/schemas';
import type { StudioAStageScene } from './studio-a-stage';
import { dotsAt, ownPathOf, placeOf, turnOf } from './studio-a-stage';

const stage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

const spot = (spotId: number, assigned: boolean): StudioSpot => ({
  spotId,
  number: spotId,
  person: assigned ? { personId: spotId, firstName: 'A', lastName: 'B', portrait: null } : null,
});

const still = (spotId: number, rightMetres: number, backMetres: number): SpotPath => ({
  spotId,
  keyframes: [
    {
      seconds: 0,
      position: { rightMetres, backMetres },
      bend: null,
      easing: 'linear',
      facingDegrees: 90,
    },
  ],
});

const walking: SpotPath = {
  spotId: 1,
  keyframes: [
    {
      seconds: 0,
      position: { rightMetres: -4, backMetres: 0 },
      bend: null,
      easing: 'linear',
      facingDegrees: null,
    },
    {
      seconds: 10,
      position: { rightMetres: 4, backMetres: 0 },
      bend: null,
      easing: 'linear',
      facingDegrees: null,
    },
  ],
};

const scene = (patch: Partial<StudioAStageScene> = {}): StudioAStageScene => ({
  paths: [walking, still(2, 0, 4), still(3, 1, 1)],
  spots: [spot(1, true), spot(2, false), spot(3, true), spot(4, true)],
  ownSpotId: 1,
  stage,
  mirrored: false,
  ...patch,
});

describe('placeOf', () => {
  it.each([
    [false, { x: 0.7, y: 0.75 }],
    [true, { x: 0.30000000000000004, y: 0.75 }],
  ])('places a point (mirrored %s)', (mirrored, place) => {
    expect(placeOf({ rightMetres: 2, backMetres: 2 }, stage, mirrored)).toEqual(place);
  });
});

describe('turnOf', () => {
  it.each([
    [null, false, null],
    [90, false, 90],
    [90, true, 270],
    [0, true, 0],
  ])('turns %s (mirrored %s) to %s', (facing, mirrored, turn) => {
    expect(turnOf(facing, mirrored)).toBe(turn);
  });
});

describe('dotsAt', () => {
  it('places every spot with a path, own dot last so it draws on top', () => {
    const dots = dotsAt(scene(), 5);

    expect(dots.map((dot) => [dot.spotId, dot.kind])).toEqual([
      [2, 'open'],
      [3, 'cast'],
      [1, 'own'],
    ]);
    expect(dots.at(-1)).toMatchObject({ x: 0.5, y: 1 });
  });
});

describe('ownPathOf', () => {
  it('traces the own way through the range', () => {
    const path = ownPathOf(scene(), { start: 0, end: 10 });

    expect(path[0]).toEqual({ x: 0.1, y: 1 });
    expect(path.at(-1)).toEqual({ x: 0.9, y: 1 });
  });

  it.each([
    [scene({ ownSpotId: 2 }), { start: 0, end: 10 }],
    [scene(), null],
    [scene({ ownSpotId: null }), { start: 0, end: 10 }],
  ])('draws no way when standing still or without a dot', (standing, range) => {
    expect(ownPathOf(standing, range)).toEqual([]);
  });
});
