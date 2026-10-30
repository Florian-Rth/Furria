import { describe, expect, it } from 'vitest';
import type { SpotPath, TimedKeyframe } from '@/features/act-player/choreography-motion';
import type { Studio, StudioSpot, StudioStep, StudioTraining } from '@/features/acts/schemas';
import { movingStepNumbersOf, trainingRollOf, trainingStudioOf } from './training-gaps';

const step = (stepId: number, startSeconds: number, endSeconds: number): StudioStep => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds,
  endSeconds,
  placement: 'onTimeline',
});

const steps: StudioStep[] = [step(11, 0, 10), step(12, 10, 20), step(13, 20, 30), step(14, 30, 40)];

const at = (
  seconds: number,
  rightMetres: number,
  bend: TimedKeyframe['bend'] = null,
): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres: 2 },
  bend,
  easing: 'linear',
  facingDegrees: null,
});

const path = (spotId: number, keyframes: TimedKeyframe[]): SpotPath => ({ spotId, keyframes });

const spot = (spotId: number, number: number, firstName: string | null): StudioSpot => ({
  spotId,
  number,
  person:
    firstName === null
      ? null
      : { personId: spotId * 10, firstName, lastName: 'Garde', portrait: null },
});

const training = (openSpotIds: number[]): StudioTraining => ({
  calendarEntryId: 5,
  title: 'Training',
  startsAt: '2026-11-03T18:30:00+01:00',
  asksForResponse: true,
  openSpotIds,
});

describe('movingStepNumbersOf', () => {
  it.each([
    ['no path', undefined, []],
    ['standing still', path(1, [at(1, 0), at(25, 0)]), []],
    ['one move inside a step', path(1, [at(12, 0), at(18, 3)]), [2]],
    ['a move across a step change', path(1, [at(8, 0), at(22, 3)]), [1, 2, 3]],
    ['a move ending on a step start', path(1, [at(5, 0), at(10, 3)]), [1]],
    [
      'a bend back to the same place',
      path(1, [at(31, 0), at(39, 0, { rightMetres: 1, backMetres: 3 })]),
      [4],
    ],
    ['two moves', path(1, [at(2, 0), at(4, 1), at(25, 1), at(28, 2)]), [1, 3]],
  ])('%s', (_case, spotPath, numbers) => {
    expect(movingStepNumbersOf(spotPath, steps)).toEqual(numbers);
  });
});

describe('trainingRollOf', () => {
  const spots = [spot(1, 1, 'Anna'), spot(2, 2, 'Ben'), spot(3, 3, null), spot(4, 4, 'Clara')];
  const paths = [path(2, [at(12, 0), at(18, 3)])];

  it('counts everyone holding a spot as there without a training', () => {
    expect(trainingRollOf(null, spots, paths, steps)).toEqual({
      expected: 3,
      present: 3,
      gaps: [],
    });
  });

  it('opens the spots of an Absage and names the steps where they move', () => {
    expect(trainingRollOf(training([2, 4]), spots, paths, steps)).toEqual({
      expected: 3,
      present: 1,
      gaps: [
        { spotId: 2, number: 2, firstName: 'Ben', stepNumbers: [2] },
        { spotId: 4, number: 4, firstName: 'Clara', stepNumbers: [] },
      ],
    });
  });
});

describe('trainingStudioOf', () => {
  const studio: Studio = {
    music: { lengthSeconds: 40, source: 'workingMix' },
    songs: [],
    finalTracks: [],
    steps: [],
    parts: [],
    spots: [spot(1, 1, 'Anna'), spot(2, 2, 'Ben')],
    videos: [],
    choreography: null,
    stage: null,
    evenings: [],
    trainings: [],
  };

  it('shows the spots of an Absage open on the stage', () => {
    expect(
      trainingStudioOf(studio, training([2])).spots.map((entry) => entry.person?.firstName ?? null),
    ).toEqual(['Anna', null]);
  });
});
