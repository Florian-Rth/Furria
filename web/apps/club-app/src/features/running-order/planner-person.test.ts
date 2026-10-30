import { describe, expect, it } from 'vitest';
import type { CastPerson } from '@/features/running-order/schemas';
import type { DraftLine, RunningOrderDraft } from '@/features/running-order/types';
import { gapStateOf, personTimelineOf } from './planner-person';

const person = (personId: number, absent = false): CastPerson => ({
  personId,
  firstName: `Person ${personId}`,
  lastName: 'Muster',
  portrait: null,
  absent,
});

const line = (actId: number, cast: CastPerson[], placed = true): DraftLine => ({
  key: `act:${actId}`,
  lineId: null,
  act: { actId, name: `Auftritt ${actId}`, kind: 'dance', group: null, cast },
  placed,
  pinned: false,
  blockKey: null,
  eveningChanges: [],
});

const draftOf = (lines: DraftLine[]): RunningOrderDraft => ({
  version: 1,
  lines,
  rules: [],
  actWishes: [],
  suspendedActWishIds: [],
});

describe('gapStateOf', () => {
  it.each([
    [0, 'conflict'],
    [1, 'hint'],
    [2, 'fine'],
    [7, 'fine'],
  ] as const)('%i Auftritte in between is %s', (between, state) => {
    expect(gapStateOf(between)).toBe(state);
  });
});

describe('personTimelineOf', () => {
  it('lists the placed appearances in order with the count in between and tallies them', () => {
    const draft = draftOf([
      line(1, [person(7)]),
      line(2, [person(7), person(8)]),
      line(3, [person(8)]),
      line(4, [person(7)]),
      line(5, []),
      line(6, []),
      line(7, [person(7)]),
      line(8, [person(7)], false),
    ]);

    expect(personTimelineOf(draft, 7)).toEqual({
      person: person(7),
      absent: false,
      stops: [
        { key: 'act:1', index: 0 },
        { key: 'act:2', index: 1 },
        { key: 'act:4', index: 3 },
        { key: 'act:7', index: 6 },
      ],
      gaps: [
        { between: 0, state: 'conflict' },
        { between: 1, state: 'hint' },
        { between: 2, state: 'fine' },
      ],
      waiting: ['act:8'],
      tally: { conflicts: 1, hints: 1 },
    });
  });

  it('keeps the appearances of an absent person but counts no gaps', () => {
    const draft = draftOf([line(1, [person(7, true)]), line(2, [person(7, true)])]);

    expect(personTimelineOf(draft, 7)).toMatchObject({
      absent: true,
      stops: [
        { key: 'act:1', index: 0 },
        { key: 'act:2', index: 1 },
      ],
      gaps: [],
      tally: { conflicts: 0, hints: 0 },
    });
  });

  it('finds nobody who is in no Auftritt of the evening', () => {
    expect(personTimelineOf(draftOf([line(1, [person(8)])]), 7)).toBeNull();
  });
});
