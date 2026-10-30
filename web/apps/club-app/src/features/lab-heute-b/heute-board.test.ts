import { describe, expect, it } from 'vitest';
import { liveFlowOf, peopleToCallOf } from '@/features/live/live-flow';
import type { LiveDirection, LiveLine, LivePerson } from '@/features/live/schemas';
import {
  callGroupsOf,
  elapsedTextOf,
  keyActionOf,
  missingOf,
  standInsOf,
  stripChipsOf,
} from './heute-board';

const person = (personId: number, absent = false, standsIn = false): LivePerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'Test',
  portrait: null,
  absent,
  standsIn,
});

const line = (
  appearanceId: number,
  cast: LivePerson[] = [],
  missing: LivePerson[] = [],
): LiveLine => ({
  appearanceId,
  actId: appearanceId * 10,
  name: `Auftritt ${appearanceId}`,
  kind: 'dance',
  group: null,
  position: appearanceId - 1,
  own: false,
  cast,
  missing,
});

const live = (appearanceId: number | null): LiveDirection => ({
  appearanceId,
  startedAt: '2026-11-11T18:11:00Z',
  movedAt: '2026-11-11T18:20:00Z',
});

const lines = [
  line(1, [person(1), person(2)]),
  line(2, [person(2), person(3)]),
  line(3, [person(4), person(5)]),
  line(4),
];

describe('stripChipsOf', () => {
  it.each([
    ['before the start', null, ['next', 'later', 'later', 'later']],
    ['on the second act', live(2), ['done', 'now', 'next', 'later']],
    ['on the last act', live(4), ['done', 'done', 'done', 'now']],
    ['after the end', live(null), ['done', 'done', 'done', 'done']],
  ] as const)('marks the acts %s', (_name, direction, states) => {
    expect(stripChipsOf(lines, liveFlowOf(lines, direction)).map((chip) => chip.state)).toEqual(
      states,
    );
  });
});

describe('callGroupsOf', () => {
  it('groups the people to call by act with its number', () => {
    const calls = peopleToCallOf(liveFlowOf(lines, live(1)));
    expect(
      callGroupsOf(lines, calls).map((group) => [
        group.number,
        group.people.map((call) => [call.person.personId, call.onStageNow]),
      ]),
    ).toEqual([
      [
        2,
        [
          [2, true],
          [3, false],
        ],
      ],
      [
        3,
        [
          [4, false],
          [5, false],
        ],
      ],
    ]);
  });
});

describe('missingOf', () => {
  it('joins the missing list with absent cast once per person', () => {
    const missing = missingOf(line(9, [person(1, true), person(2), person(3, true)], [person(3)]));
    expect(missing.map((entry) => entry.personId)).toEqual([3, 1]);
  });
});

describe('standInsOf', () => {
  it('keeps the stand-ins who are there', () => {
    const standIns = standInsOf(
      line(9, [person(1, false, true), person(2), person(3, true, true)]),
    );
    expect(standIns.map((entry) => entry.personId)).toEqual([1]);
  });
});

describe('elapsedTextOf', () => {
  it.each([
    [0, '0:00'],
    [65, '1:05'],
    [3725, '1:02:05'],
  ])('formats %i seconds', (seconds, text) => {
    expect(elapsedTextOf(seconds)).toBe(text);
  });
});

describe('keyActionOf', () => {
  it.each([
    ['ArrowRight', false, 'forward'],
    [' ', false, 'forward'],
    [' ', true, null],
    ['Enter', true, null],
    ['ArrowRight', true, 'forward'],
    ['ArrowLeft', false, 'back'],
    ['a', false, null],
  ] as const)('reads %j (on a control: %s)', (key, onControl, action) => {
    expect(keyActionOf(key, onControl)).toBe(action);
  });
});
