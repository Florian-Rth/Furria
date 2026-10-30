import { describe, expect, it } from 'vitest';
import type { SeasonAct } from '@/features/season/schemas';
import {
  byReadiness,
  checkStatesOf,
  dotOf,
  eveningTallyOf,
  filteredActs,
  groupFiltersOf,
} from './season-c-rows';

const actOf = (
  actId: number,
  done: number,
  groupId: number | null,
  appearances: SeasonAct['appearances'] = [],
): SeasonAct => ({
  actId,
  name: `Auftritt ${actId}`,
  kind: 'dance',
  group:
    groupId === null
      ? null
      : { groupId, name: `G${groupId}`, tone: null, icon: null, picture: null },
  castCount: 4,
  readiness: [
    { check: 'music', done: done > 0 },
    { check: 'steps', done: done > 1 },
    { check: 'formation', done: done > 2 },
  ],
  appearances,
});

const placed = (eventId: number, position: number | null, adjusted = false) => ({
  appearanceId: eventId * 100 + (position ?? 99),
  eventId,
  position,
  changes: adjusted ? (['cast'] as const).slice() : [],
  added: [],
  removed: [],
});

describe('byReadiness', () => {
  it('puts the smallest done share first, then the one on more evenings, then by name', () => {
    const acts = [
      actOf(1, 3, null),
      actOf(2, 1, null),
      actOf(3, 1, null, [placed(17, 0), placed(18, 2)]),
      actOf(4, 0, null),
      { ...actOf(5, 1, null), readiness: [{ check: 'cast' as const, done: true }] },
    ];
    expect(byReadiness(acts).map((act) => act.actId)).toEqual([4, 3, 2, 1, 5]);
  });
});

describe('filteredActs', () => {
  const acts = [actOf(1, 3, 5), actOf(2, 1, 5), actOf(3, 0, 6), actOf(4, 2, null)];

  it.each([
    ['open', [2, 3, 4]],
    ['all', [1, 2, 3, 4]],
    ['group-5', [1, 2]],
    ['group-9', []],
  ])('keeps %s', (filter, expected) => {
    expect(filteredActs(acts, filter).map((act) => act.actId)).toEqual(expected);
  });
});

describe('groupFiltersOf', () => {
  it('counts the acts per group and skips acts without one', () => {
    expect(
      groupFiltersOf([actOf(1, 0, 6), actOf(2, 0, 5), actOf(3, 0, 6), actOf(4, 0, null)]),
    ).toEqual([
      { id: 'group-5', name: 'G5', count: 1 },
      { id: 'group-6', name: 'G6', count: 2 },
    ]);
  });
});

describe('dotOf', () => {
  const act = actOf(1, 0, null, [placed(17, 3), placed(18, null), placed(19, 0, true)]);

  it.each([
    [17, 'placed', 4],
    [18, 'tray', null],
    [19, 'adjusted', 1],
    [20, 'none', null],
  ] as const)('reads evening %i as %s', (eventId, kind, number) => {
    expect(dotOf(act, eventId)).toEqual({ kind, number });
  });
});

describe('eveningTallyOf', () => {
  it('counts placed, tray and adjusted acts of one evening', () => {
    const acts = [
      actOf(1, 0, null, [placed(17, 0)]),
      actOf(2, 0, null, [placed(17, null)]),
      actOf(3, 0, null, [placed(17, 1, true), placed(18, 0)]),
      actOf(4, 0, null, [placed(18, 1)]),
    ];
    expect(eveningTallyOf(acts, 17)).toEqual({ placed: 2, tray: 1, adjusted: 1 });
  });
});

describe('checkStatesOf', () => {
  it('lists every check in the fixed order and marks the ones that do not apply', () => {
    expect(checkStatesOf(actOf(1, 2, null)).map((state) => [state.check, state.mark])).toEqual([
      ['music', 'done'],
      ['steps', 'done'],
      ['formation', 'open'],
      ['videos', 'none'],
      ['finalFile', 'none'],
      ['cast', 'none'],
    ]);
  });
});
