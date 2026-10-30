import { describe, expect, it } from 'vitest';
import type { ActSeasonResponse, SeasonAct } from '@/features/season/schemas';
import { actIndexOf, eveningColumnsOf, markPlaceOf, navigationGridOf } from './season-columns';

const actOf = (
  actId: number,
  name: string,
  appearances: [number, number | null, boolean][],
): SeasonAct => ({
  actId,
  name,
  kind: 'dance',
  group: null,
  castCount: 4,
  readiness: [
    { check: 'music', done: true },
    { check: 'cast', done: false },
  ],
  appearances: appearances.map(([eventId, position, adjusted], index) => ({
    appearanceId: actId * 100 + index,
    eventId,
    position,
    changes: adjusted ? ['cast'] : [],
    added: [],
    removed: [],
  })),
});

const evening = (eventId: number) => ({
  eventId,
  title: `Abend ${eventId}`,
  startsAt: '2027-01-23T19:11:00+00:00',
  hasRunningOrder: true,
  confirmed: false,
});

const season: ActSeasonResponse = {
  sessionYear: 2026,
  sessionYears: [2026],
  evenings: [evening(1), evening(2)],
  acts: [
    actOf(10, 'Zugabe', [[1, 0, false]]),
    actOf(11, 'Marsch', [
      [1, 2, true],
      [2, null, false],
    ]),
    actOf(12, 'Büttenrede', [[1, 1, false]]),
    actOf(13, 'Auftakt', [[2, 0, false]]),
  ],
};

const actIds = (entries: readonly { act: SeasonAct }[]): number[] =>
  entries.map((entry) => entry.act.actId);

describe('eveningColumnsOf', () => {
  const [first, second] = eveningColumnsOf(season);

  it('orders the evening by place and numbers from one', () => {
    expect(first?.lines.map((line) => [line.act.actId, line.number, line.adjusted])).toEqual([
      [10, 1, false],
      [12, 2, false],
      [11, 3, true],
    ]);
  });

  it('puts unplaced acts into the tray and the rest aside by name', () => {
    expect([
      actIds(second?.lines ?? []),
      actIds(second?.tray ?? []),
      actIds(second?.absent ?? []),
    ]).toEqual([[13], [11], [12, 10]]);
  });
});

describe('actIndexOf', () => {
  it('lists every act by name with the evenings it is placed on', () => {
    expect(
      actIndexOf(season).map((entry) => [entry.act.actId, entry.evenings, entry.readiness.done]),
    ).toEqual([
      [13, 1, 1],
      [12, 1, 1],
      [11, 1, 1],
      [10, 1, 1],
    ]);
  });
});

describe('markPlaceOf', () => {
  const [first, second] = eveningColumnsOf(season);

  it.each([
    ['placed', first, 11, { state: 'placed', number: 3 }],
    ['in the tray', second, 11, { state: 'tray' }],
    ['not on the evening', second, 10, { state: 'none' }],
  ] as const)('reads an act %s', (_name, column, actId, place) => {
    expect(column === undefined ? null : markPlaceOf(column, actId)).toEqual(place);
  });
});

describe('navigationGridOf', () => {
  it('puts the index first, then each evening as lines, tray and the rest', () => {
    const columns = eveningColumnsOf(season);
    expect(navigationGridOf(actIndexOf(season), columns)).toEqual([
      ['act:13', 'act:12', 'act:11', 'act:10'],
      ['1:10', '1:12', '1:11', '1:13'],
      ['2:13', '2:11', '2:12', '2:10'],
    ]);
  });
});
