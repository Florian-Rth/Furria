import { describe, expect, it } from 'vitest';
import {
  backMoveOf,
  elapsedSecondsOf,
  forwardMoveOf,
  liveFlowOf,
  peopleToCallOf,
} from './live-flow';
import type { LiveDirection, LiveLine, LivePerson } from './schemas';

const person = (personId: number, absent = false): LivePerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'Test',
  portrait: null,
  absent,
  standsIn: false,
});

const line = (appearanceId: number, cast: LivePerson[] = []): LiveLine => ({
  appearanceId,
  actId: appearanceId * 10,
  name: `Auftritt ${appearanceId}`,
  kind: 'dance',
  group: null,
  position: appearanceId - 1,
  own: false,
  cast,
  missing: [],
});

const lines = [
  line(1, [person(1), person(2)]),
  line(2, [person(2), person(3), person(4, true)]),
  line(3, [person(3), person(5)]),
];

const live = (appearanceId: number | null): LiveDirection => ({
  appearanceId,
  startedAt: '2026-11-11T18:11:00Z',
  movedAt: '2026-11-11T18:20:00Z',
});

const idOf = (value: LiveLine | null): number | null =>
  value === null ? null : value.appearanceId;

describe('liveFlowOf', () => {
  it.each([
    ['not started', null, 'before', null, 1, 2],
    ['on the first act', live(1), 'running', 1, 2, 3],
    ['on the last act', live(3), 'running', 3, null, null],
    ['past the last act', live(null), 'ended', null, null, null],
    ['on an act no longer in the order', live(9), 'before', null, 1, 2],
  ] as const)('reads %s', (_name, direction, state, now, next, after) => {
    const flow = liveFlowOf(lines, direction);

    expect([flow.state, idOf(flow.now), idOf(flow.next), idOf(flow.after)]).toEqual([
      state,
      now,
      next,
      after,
    ]);
  });
});

describe('forwardMoveOf', () => {
  it.each([
    ['starts the night', null, { from: null, to: 1 }],
    ['moves to the next act', live(1), { from: 1, to: 2 }],
    ['ends the night after the last act', live(3), { from: 3, to: null }],
    ['does nothing once ended', live(null), null],
  ] as const)('%s', (_name, direction, move) => {
    expect(forwardMoveOf(liveFlowOf(lines, direction))).toEqual(move);
  });
});

describe('backMoveOf', () => {
  it.each([
    ['steps back one act', live(2), { from: 2, to: 1 }],
    ['cannot step back from the first act', live(1), null],
    ['cannot step back before the start', null, null],
  ] as const)('%s', (_name, direction, move) => {
    expect(backMoveOf(lines, liveFlowOf(lines, direction))).toEqual(move);
  });
});

describe('peopleToCallOf', () => {
  it('calls the next two acts once per person, skips absences and flags who is on stage', () => {
    const called = peopleToCallOf(liveFlowOf(lines, live(1))).map((call) => [
      call.person.personId,
      call.line.appearanceId,
      call.onStageNow,
    ]);

    expect(called).toEqual([
      [2, 2, true],
      [3, 2, false],
      [5, 3, false],
    ]);
  });
});

describe('elapsedSecondsOf', () => {
  it.each([
    ['2026-11-11T18:20:00Z', Date.parse('2026-11-11T18:22:05Z'), 125],
    ['2026-11-11T18:20:00Z', Date.parse('2026-11-11T18:19:00Z'), 0],
  ])('counts from %s', (since, now, seconds) => {
    expect(elapsedSecondsOf(since, now)).toBe(seconds);
  });
});
