import type { SpotPath } from '@furria/studio/choreography-motion';
import { describe, expect, it } from 'vitest';
import {
  bendPointOf,
  keyGroupsOf,
  linedUpPlaces,
  mirroredPlaces,
  moveAt,
  withBend,
  withGroupRetimed,
  withSpotsPlaced,
} from './stage-edits';

const key = (seconds: number, right: number, back: number) => ({
  seconds,
  position: { rightMetres: right, backMetres: back },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
});

const paths: SpotPath[] = [
  { spotId: 1, keyframes: [key(0, 0, 0), key(4, 2, 0), key(8, 2, 2)] },
  { spotId: 2, keyframes: [key(0, 1, 1), key(4, 3, 1)] },
];

const timesOf = (changed: readonly SpotPath[], spotId: number) =>
  changed.find((path) => path.spotId === spotId)?.keyframes.map((keyframe) => keyframe.seconds);

describe('withSpotsPlaced', () => {
  it('moves a keyframe at the time and adds one between keyframes', () => {
    const changed = withSpotsPlaced(
      paths,
      4.02,
      new Map([
        [1, { rightMetres: 5, backMetres: 5 }],
        [2, { rightMetres: 6, backMetres: 6 }],
      ]),
    );

    expect(changed[0]?.keyframes[1]?.position).toEqual({ rightMetres: 5, backMetres: 5 });
    expect(timesOf(changed, 1)).toEqual([0, 4, 8]);
    expect(timesOf(changed, 2)).toEqual([0, 4]);
  });

  it('inserts a keyframe in time order and starts a path for a new spot', () => {
    const changed = withSpotsPlaced(
      paths,
      2,
      new Map([
        [1, { rightMetres: 1, backMetres: 1 }],
        [7, { rightMetres: 0, backMetres: 3 }],
      ]),
    );

    expect(timesOf(changed, 1)).toEqual([0, 2, 4, 8]);
    expect(timesOf(changed, 7)).toEqual([2]);
  });
});

describe('moveAt', () => {
  it.each([
    [-1, [0, 1]],
    [2, [0, 1]],
    [4, [1, 2]],
    [6, [1, 2]],
    [20, [1, 2]],
  ])('at %s s edits keyframes %j', (seconds, indices) => {
    const move = moveAt(paths[0] ?? { spotId: 0, keyframes: [] }, seconds);

    expect([move?.fromIndex, move?.toIndex]).toEqual(indices);
  });

  it('needs two keyframes', () => {
    expect(moveAt({ spotId: 3, keyframes: [key(0, 0, 0)] }, 1)).toBeNull();
  });
});

describe('bendPointOf', () => {
  it.each([
    [null, { rightMetres: 1, backMetres: 0 }],
    [
      { rightMetres: 1, backMetres: 2 },
      { rightMetres: 1, backMetres: 2 },
    ],
  ])('with bend %j sits at %j', (bend, point) => {
    const from = key(0, 0, 0);
    const to = { ...key(4, 2, 0), bend };

    expect(bendPointOf({ spotId: 1, fromIndex: 0, toIndex: 1, from, to })).toEqual(point);
  });
});

describe('withBend', () => {
  it('bends only the chosen move', () => {
    const changed = withBend(paths, 1, 2, { rightMetres: 3, backMetres: 1 });

    expect(changed[0]?.keyframes.map((keyframe) => keyframe.bend)).toEqual([
      null,
      null,
      { rightMetres: 3, backMetres: 1 },
    ]);
    expect(changed[1]).toBe(paths[1]);
  });
});

describe('keyGroupsOf', () => {
  it.each([
    [
      [],
      [
        ['0.00', 2],
        ['4.00', 2],
        ['8.00', 1],
      ],
    ],
    [
      [2],
      [
        ['0.00', 1],
        ['4.00', 1],
      ],
    ],
  ])('groups keyframes of spots %j', (spotIds, groups) => {
    expect(
      keyGroupsOf(paths, new Set(spotIds)).map((group) => [group.key, group.members.length]),
    ).toEqual(groups);
  });
});

describe('withGroupRetimed', () => {
  const group = keyGroupsOf(paths, new Set()).find((candidate) => candidate.key === '4.00');

  it.each([
    [5, [0, 5, 8], [0, 5]],
    [9, [0, 7.9, 8], [0, 7.9]],
    [-3, [0, 0.1, 8], [0, 0.1]],
  ])('moves the formation change to %s s', (seconds, first, second) => {
    if (group === undefined) {
      throw new Error('group');
    }
    const changed = withGroupRetimed(paths, group, seconds);

    expect(timesOf(changed, 1)?.map((time) => Number(time.toFixed(2)))).toEqual(first);
    expect(timesOf(changed, 2)?.map((time) => Number(time.toFixed(2)))).toEqual(second);
  });
});

describe('mirroredPlaces and linedUpPlaces', () => {
  const places = new Map([
    [1, { rightMetres: 2, backMetres: 1 }],
    [2, { rightMetres: -1, backMetres: 3 }],
    [3, { rightMetres: 5, backMetres: 2 }],
  ]);

  it('mirrors across the centre line', () => {
    expect(mirroredPlaces(places).get(2)).toEqual({ rightMetres: 1, backMetres: 3 });
  });

  it('lines up one metre apart around the middle, keeping the order', () => {
    expect([...linedUpPlaces(places).entries()]).toEqual([
      [2, { rightMetres: 1, backMetres: 2 }],
      [1, { rightMetres: 2, backMetres: 2 }],
      [3, { rightMetres: 3, backMetres: 2 }],
    ]);
  });
});
