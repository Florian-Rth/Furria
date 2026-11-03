import type { SpotPath } from '@furria/studio/choreography-motion';
import {
  countsIn,
  coveringVideoOf,
  movesWithin,
  stepGroupsOf,
  stepRangeOf,
} from '@furria/studio/score-steps';
import type { StudioStep, StudioVideo } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';

const step = (patch: Partial<StudioStep>): StudioStep => ({
  stepId: 1,
  name: 'Einmarsch',
  description: null,
  startSeconds: 0,
  endSeconds: 8,
  placement: 'onTimeline',
  ...patch,
});

const video = (patch: Partial<StudioVideo>): StudioVideo => ({
  videoId: 1,
  mediaItemId: 20,
  name: null,
  state: 'ready',
  durationSeconds: 40,
  startSeconds: 0,
  placement: 'onTimeline',
  outdated: false,
  urls: { video: '/v', compact: '/c', poster: '/p' },
  ...patch,
});

const path = (frames: readonly [number, number][]): SpotPath => ({
  spotId: 1,
  keyframes: frames.map(([seconds, right]) => ({
    seconds,
    position: { rightMetres: right, backMetres: 2 },
    bend: null,
    easing: 'linear',
    facingDegrees: null,
  })),
});

describe('stepRangeOf', () => {
  it.each([
    ['on the music', step({}), { start: 0, end: 8 }],
    ['cut away', step({ placement: 'cutAway' }), null],
    ['without an end', step({ endSeconds: null }), null],
    ['with no length', step({ startSeconds: 8, endSeconds: 8 }), null],
  ])('places a step %s', (_, input, expected) => {
    expect(stepRangeOf(input)).toEqual(expected);
  });
});

describe('countsIn', () => {
  const marks = Array.from({ length: 20 }, (_, index) => ({ seconds: index * 0.5, count: 1 }));

  it.each([
    [
      { start: 0, end: 8 },
      { eights: 2, rest: 0 },
    ],
    [
      { start: 0, end: 10 },
      { eights: 2, rest: 4 },
    ],
    [
      { start: 1, end: 3 },
      { eights: 0, rest: 4 },
    ],
    [{ start: 20, end: 30 }, null],
  ])('counts the beats in %o', (range, expected) => {
    expect(countsIn(marks, range)).toEqual(expected);
  });
});

describe('movesWithin', () => {
  it.each([
    [
      'a place change inside the step',
      [
        path([
          [0, 0],
          [4, 2],
        ]),
      ],
      true,
    ],
    [
      'a hold on the same place',
      [
        path([
          [0, 0],
          [4, 0],
        ]),
      ],
      false,
    ],
    [
      'a move that ends before the step',
      [
        path([
          [0, 0],
          [1, 2],
          [20, 2],
        ]),
      ],
      false,
    ],
    [
      'a move that runs through the step',
      [
        path([
          [0, 0],
          [20, 4],
        ]),
      ],
      true,
    ],
    ['no choreography', [], false],
  ])('sees %s', (_, paths, expected) => {
    expect(movesWithin(paths, { start: 2, end: 8 })).toBe(expected);
  });
});

describe('coveringVideoOf', () => {
  const range = { start: 10, end: 20 };

  it('takes the video that covers most of the step and starts it at the step', () => {
    expect(
      coveringVideoOf(
        [video({ videoId: 1, startSeconds: 14 }), video({ videoId: 2, startSeconds: 6 })],
        range,
        null,
      ),
    ).toEqual({ videoId: 2, offsetSeconds: 4 });
  });

  it('prefers the part video when it covers the step too', () => {
    expect(
      coveringVideoOf(
        [video({ videoId: 1, startSeconds: 12 }), video({ videoId: 2, startSeconds: 6 })],
        range,
        1,
      ),
    ).toEqual({ videoId: 1, offsetSeconds: 0 });
  });

  it.each([
    ['covers less than half', video({ startSeconds: 16 })],
    ['is not on the music', video({ placement: 'unaligned' })],
    ['is still processing', video({ state: 'processing' })],
  ])('skips a video that %s', (_, candidate) => {
    expect(coveringVideoOf([candidate], range, null)).toBeNull();
  });
});

describe('stepGroupsOf', () => {
  const scoreStep = (stepId: number, partId: number | null) => ({
    stepId,
    number: stepId,
    name: '',
    description: null,
    range: null,
    partId,
    partIndex: null,
    counts: null,
    movement: false,
    video: null,
    flag: null,
  });
  const part = (partId: number) => ({
    partId,
    index: partId,
    name: '',
    range: null,
    stepIds: [],
  });

  it('groups by part, drops empty parts and puts loose steps last', () => {
    const groups = stepGroupsOf(
      [scoreStep(1, 2), scoreStep(2, null), scoreStep(3, 1)],
      [part(1), part(2), part(3)],
    );

    expect(
      groups.map((group) => [group.part?.partId ?? null, group.steps.map((s) => s.stepId)]),
    ).toEqual([
      [1, [3]],
      [2, [1]],
      [null, [2]],
    ]);
  });
});
