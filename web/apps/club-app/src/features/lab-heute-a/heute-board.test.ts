import { describe, expect, it } from 'vitest';
import type { LiveFlow } from '@/features/live/live-flow';
import type { LiveLine, LivePerson } from '@/features/live/schemas';
import {
  callGroupsOf,
  clockReadingOf,
  forwardKindOf,
  keyIntentOf,
  minutesOf,
  spanOf,
  stripOf,
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

const flow = (state: LiveFlow['state'], next: LiveLine | null): LiveFlow => ({
  state,
  index: state === 'running' ? 0 : null,
  now: state === 'running' ? line(1) : null,
  next,
  after: null,
});

describe('forwardKindOf', () => {
  it.each([
    ['before', line(1), 'start'],
    ['running', line(2), 'next'],
    ['running', null, 'end'],
    ['ended', null, 'over'],
  ] as const)('reads %s with a next act as %s', (state, next, expected) => {
    expect(forwardKindOf(flow(state, next))).toBe(expected);
  });
});

describe('keyIntentOf', () => {
  it.each([
    ['ArrowRight', false, 'forward'],
    ['ArrowRight', true, 'forward'],
    [' ', false, 'forward'],
    [' ', true, null],
    ['Enter', true, null],
    ['ArrowLeft', false, 'back'],
    ['x', false, null],
  ] as const)('maps %j (on a control: %s) to %s', (key, onControl, expected) => {
    expect(keyIntentOf(key, onControl)).toBe(expected);
  });
});

describe('stripOf', () => {
  it('names each missing person once and who stands in', () => {
    const strip = stripOf(
      line(1, [person(1), person(2, true), person(3, false, true)], [person(2, true), person(4)]),
    );

    expect([
      strip.missing.map((missing) => missing.personId),
      strip.standsIn.map((standIn) => standIn.personId),
    ]).toEqual([[2, 4], [3]]);
  });

  it('is empty without an act', () => {
    expect(stripOf(null)).toEqual({ missing: [], standsIn: [] });
  });
});

describe('callGroupsOf', () => {
  it('groups the people to call by act in call order', () => {
    const next = line(2);
    const after = line(3);
    const groups = callGroupsOf([
      { person: person(1), line: next, onStageNow: false },
      { person: person(2), line: next, onStageNow: true },
      { person: person(3), line: after, onStageNow: false },
    ]);

    expect(
      groups.map((group) => [
        group.line.appearanceId,
        group.people.map((call) => call.person.personId),
      ]),
    ).toEqual([
      [2, [1, 2]],
      [3, [3]],
    ]);
  });
});

describe('clockReadingOf', () => {
  const live = {
    appearanceId: 1,
    startedAt: '2026-11-11T18:00:00Z',
    movedAt: '2026-11-11T18:40:00Z',
  };
  const nowMs = Date.parse('2026-11-11T18:45:30Z');

  it.each([
    ['running', live, { kind: 'running', count: 5, eveningSeconds: 2730 }],
    ['ended', { ...live, appearanceId: null }, { kind: 'ended', count: 40, eveningSeconds: 2400 }],
    ['before', null, { kind: 'before', count: 12, eveningSeconds: null }],
  ] as const)('reads the clock %s', (state, direction, expected) => {
    expect(clockReadingOf(flow(state, null), direction, 12, nowMs)).toEqual(expected);
  });
});

describe('minutesOf and spanOf', () => {
  it.each([
    [59, 0, { hours: 0, minutes: 0 }],
    [125, 2, { hours: 0, minutes: 2 }],
    [3725, 62, { hours: 1, minutes: 2 }],
  ])('reads %i seconds', (seconds, minutes, span) => {
    expect([minutesOf(seconds), spanOf(seconds)]).toEqual([minutes, span]);
  });
});
