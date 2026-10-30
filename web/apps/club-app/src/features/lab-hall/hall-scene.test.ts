import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioSpot, StudioStep, StudioTraining } from '@/features/acts/schemas';
import type { HallScene } from './hall-scene';
import {
  hallAbsencesOf,
  hallDotsAt,
  hallTrainingOf,
  nextStepOf,
  withNameSides,
} from './hall-scene';

const person = (personId: number, firstName: string) => ({
  personId,
  firstName,
  lastName: 'Kehr',
  portrait: null,
});

const spots: StudioSpot[] = [
  { spotId: 11, number: 1, person: person(1, 'Lena') },
  { spotId: 12, number: 2, person: person(2, 'Mia') },
  { spotId: 13, number: 3, person: null },
];

const standing = (spotId: number, rightMetres: number, backMetres: number): SpotPath => ({
  spotId,
  keyframes: [
    {
      seconds: 0,
      position: { rightMetres, backMetres },
      bend: null,
      easing: 'linear',
      facingDegrees: null,
    },
  ],
});

const training = (calendarEntryId: number, startsAt: string, openSpotIds: number[]) =>
  ({
    calendarEntryId,
    title: 'Training',
    startsAt,
    responses: [],
    openSpotIds,
  }) satisfies StudioTraining;

const scene = (viewpoint: HallScene['viewpoint']): HallScene => ({
  paths: [standing(11, 2, 2), standing(12, 0, 4), standing(13, -2, 6)],
  spots,
  stage: { widthMetres: 10, depthMetres: 8, artworkSvg: null },
  absentSpotIds: [12],
  viewpoint,
});

describe('hallDotsAt', () => {
  it('names every held spot and marks who is missing today, in a steady order', () => {
    expect(hallDotsAt(scene('dancers'), 1).map((dot) => [dot.number, dot.name, dot.kind])).toEqual([
      [1, 'Lena', 'present'],
      [2, 'Mia', 'absent'],
      [3, null, 'empty'],
    ]);
  });

  it.each([
    ['dancers', { x: 0.3, y: 0.25 }],
    ['audience', { x: 0.7, y: 0.75 }],
  ] as const)('places a dot as seen by the %s', (viewpoint, place) => {
    const lena = hallDotsAt(scene(viewpoint), 1).find((dot) => dot.spotId === 11);

    expect({ x: lena?.x, y: lena?.y }).toEqual(place);
  });
});

describe('withNameSides', () => {
  const dot = (spotId: number, x: number, y: number, name: string | null = 'Lena') => ({
    spotId,
    number: spotId,
    name,
    kind: 'present' as const,
    moving: false,
    x,
    y,
  });
  const sidesOf = (dots: ReturnType<typeof dot>[]) =>
    withNameSides(dots).map((named) => [named.spotId, named.nameSide]);

  it('alternates the names of a line below and above so they never overlap', () => {
    expect(sidesOf([0.3, 0.075, 0.15, 0, 0.225].map((x, index) => dot(index + 1, x, 0.5)))).toEqual(
      [
        [4, 'below'],
        [2, 'above'],
        [3, 'below'],
        [5, 'above'],
        [1, 'below'],
      ],
    );
  });

  it('hides a name with no free side and never names an empty spot', () => {
    expect(
      sidesOf([dot(1, 0.5, 0.5), dot(2, 0.52, 0.5), dot(3, 0.54, 0.5), dot(4, 0.9, 0.5, null)]),
    ).toEqual([
      [1, 'below'],
      [2, 'above'],
      [3, 'none'],
      [4, 'none'],
    ]);
  });

  it('names dots of another row freely', () => {
    expect(sidesOf([dot(1, 0.5, 0.5), dot(2, 0.5, 0.7)])).toEqual([
      [1, 'below'],
      [2, 'below'],
    ]);
  });
});

describe('hallTrainingOf', () => {
  const trainings = [
    training(8, '2026-11-06T18:00:00+01:00', []),
    training(7, '2026-11-03T18:00:00+01:00', [12]),
  ];

  it.each([
    [8, 8],
    [undefined, 7],
    [99, 7],
  ])('takes training %s when asked, else the earliest', (chosen, expected) => {
    expect(hallTrainingOf(trainings, chosen)?.calendarEntryId).toBe(expected);
  });

  it('has no training when none is planned', () => {
    expect(hallTrainingOf([], 8)).toBeNull();
  });
});

describe('hallAbsencesOf', () => {
  it('lists the cast that cancelled by spot number, never an empty spot', () => {
    expect(hallAbsencesOf(spots, training(7, '2026-11-03T18:00:00+01:00', [13, 12, 11]))).toEqual([
      { spotId: 11, number: 1, name: 'Lena' },
      { spotId: 12, number: 2, name: 'Mia' },
    ]);
  });

  it('misses nobody without a training', () => {
    expect(hallAbsencesOf(spots, null)).toEqual([]);
  });
});

describe('nextStepOf', () => {
  const step = (stepId: number): StudioStep => ({
    stepId,
    name: '',
    description: null,
    startSeconds: stepId,
    endSeconds: stepId + 1,
    placement: 'onTimeline',
  });
  const steps = [step(1), step(2), step(3)];

  it.each([
    [1, 2],
    [3, null],
    [null, 1],
  ])('follows step %s with step %s', (current, next) => {
    expect(nextStepOf(steps, current)?.stepId ?? null).toBe(next);
  });
});
