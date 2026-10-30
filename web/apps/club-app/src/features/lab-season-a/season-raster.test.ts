import { describe, expect, it } from 'vitest';
import type { SeasonAct } from '@/features/season/schemas';
import {
  eveningCastOf,
  eveningTallyOf,
  movedSpotOf,
  rasterRowsOf,
  snappedColumnOf,
  spotOfKey,
} from './season-raster';

const actOf = (
  actId: number,
  name: string,
  groupName: string | null,
  done: number,
  positions: (number | null)[] = [],
): SeasonAct => ({
  actId,
  name,
  kind: 'dance',
  group:
    groupName === null
      ? null
      : { groupId: groupName.length, name: groupName, tone: null, icon: null, picture: null },
  castCount: 4,
  readiness: [
    { check: 'music', done: done > 0 },
    { check: 'steps', done: done > 1 },
    { check: 'formation', done: done > 2 },
  ],
  appearances: positions.map((position, index) => ({
    appearanceId: actId * 10 + index,
    eventId: 100 + index,
    position,
    changes: [],
    added: [],
    removed: [],
  })),
});

const acts = [
  actOf(1, 'Zugabe', 'Tanzgarde', 3, [0, null]),
  actOf(2, 'Begrüßung', null, 0, [1]),
  actOf(3, 'Marsch', 'Tanzgarde', 1, [null, 2]),
  actOf(4, 'Ballett', 'Elferrat', 2),
];

const keysOf = (order: 'group' | 'ready' | 'name'): string[] =>
  rasterRowsOf(acts, order).map((row) =>
    row.kind === 'group' ? `${row.key}/${row.count}` : `${row.act.actId}@${row.line}`,
  );

describe('rasterRowsOf', () => {
  it.each([
    ['group', ['group:8/1', '4@0', 'group:9/2', '3@1', '1@2', 'group:none/1', '2@3']],
    ['ready', ['2@0', '3@1', '4@2', '1@3']],
    ['name', ['4@0', '2@1', '3@2', '1@3']],
  ] as const)('orders by %s and numbers the act lines', (order, expected) => {
    expect(keysOf(order)).toEqual([...expected]);
  });
});

describe('movedSpotOf', () => {
  it.each([
    ['ArrowDown', { line: 1, column: 1 }],
    ['ArrowUp', { line: 0, column: 1 }],
    ['ArrowRight', { line: 0, column: 2 }],
    ['ArrowLeft', { line: 0, column: 0 }],
    ['Home', { line: 0, column: 0 }],
    ['End', { line: 0, column: 2 }],
    ['PageDown', { line: 4, column: 1 }],
    ['Enter', null],
  ])('moves %s from the top row, staying inside the grid', (key, expected) => {
    expect(movedSpotOf({ line: 0, column: 1 }, key, 5, 3)).toEqual(expected);
  });

  it('stays on the last column at the right edge', () => {
    expect(movedSpotOf({ line: 2, column: 2 }, 'ArrowRight', 5, 3)).toEqual({
      line: 2,
      column: 2,
    });
  });
});

describe('spotOfKey', () => {
  it.each([
    ['3:4', { line: 3, column: 4 }],
    ['x', null],
    [undefined, null],
  ])('reads %s', (key, expected) => {
    expect(spotOfKey(key)).toEqual(expected);
  });
});

describe('eveningTallyOf', () => {
  it.each([
    [100, { placed: 2, tray: 1 }],
    [101, { placed: 1, tray: 1 }],
    [102, { placed: 0, tray: 0 }],
  ])('counts placed and tray acts of evening %i', (eventId, expected) => {
    expect(eveningTallyOf(acts, eventId)).toEqual(expected);
  });
});

describe('eveningCastOf', () => {
  const person = (personId: number, firstName: string) => ({
    personId,
    firstName,
    lastName: 'Test',
    portrait: null,
  });

  it('marks who is out and who stands in for the evening', () => {
    const cast = eveningCastOf([person(1, 'Anna'), person(2, 'Ben'), person(3, 'Cleo')], {
      appearanceId: 1,
      eventId: 100,
      position: 0,
      changes: ['cast'],
      added: [{ ...person(9, 'Dora'), absent: false }],
      removed: [{ ...person(2, 'Ben'), absent: false }],
    });

    expect([
      cast.out,
      cast.standIns,
      cast.tiles.map((tile) => [tile.person.personId, tile.state]),
    ]).toEqual([
      1,
      1,
      [
        [1, 'in'],
        [2, 'out'],
        [3, 'in'],
        [9, 'guest'],
      ],
    ]);
  });
});

describe('snappedColumnOf', () => {
  it.each([
    [0, 0],
    [190, 1],
    [410, 2],
    [2000, 5],
  ])('snaps scroll %i to evening %i', (scrollLeft, expected) => {
    expect(snappedColumnOf(scrollLeft, 1200, 6)).toBe(expected);
  });
});
