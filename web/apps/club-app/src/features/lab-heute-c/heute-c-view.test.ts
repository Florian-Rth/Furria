import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { liveFlowOf } from '@/features/live/live-flow';
import type { LiveLine, LivePerson } from '@/features/live/schemas';
import {
  ablaufOf,
  elapsedTextOf,
  isOverrunError,
  keyIntentOf,
  lineCastOf,
  weiterKindOf,
} from './heute-c-view';

const person = (personId: number, absent = false, standsIn = false): LivePerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'Test',
  portrait: null,
  absent,
  standsIn,
});

const line = (appearanceId: number, cast: LivePerson[] = [], missing: LivePerson[] = []) => ({
  appearanceId,
  actId: appearanceId * 10,
  name: `Auftritt ${appearanceId}`,
  kind: 'dance' as const,
  group: null,
  position: appearanceId - 1,
  own: false,
  cast,
  missing,
});

const lines: LiveLine[] = [line(1), line(2), line(3)];
const at = (appearanceId: number | null) => ({
  appearanceId,
  startedAt: '2026-11-11T18:11:00Z',
  movedAt: '2026-11-11T18:20:00Z',
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

describe('ablaufOf', () => {
  it.each([
    ['before the start', null, ['open', 'open', 'open']],
    ['on the second act', at(2), ['done', 'current', 'open']],
    ['after the end', at(null), ['done', 'done', 'done']],
  ] as const)('marks the order %s', (_name, live, states) => {
    expect(ablaufOf(lines, liveFlowOf(lines, live)).map((entry) => entry.state)).toEqual(states);
  });
});

describe('lineCastOf', () => {
  it('splits the evening cast into present, standing in and missing', () => {
    const cast = lineCastOf(
      line(1, [person(1), person(2, true), person(3, false, true)], [person(4), person(2, true)]),
    );
    expect([
      cast.present.map((one) => one.personId),
      cast.standIns.map((one) => one.personId),
      cast.missing.map((one) => one.personId),
    ]).toEqual([[1], [3], [2, 4]]);
  });
});

describe('weiterKindOf', () => {
  it.each([
    [null, 'start'],
    [at(1), 'next'],
    [at(3), 'finish'],
    [at(null), 'over'],
  ] as const)('reads %o as %s', (live, kind) => {
    expect(weiterKindOf(liveFlowOf(lines, live))).toBe(kind);
  });
});

describe('keyIntentOf', () => {
  it.each([
    ['ArrowRight', false, 'forward'],
    [' ', false, 'forward'],
    ['Enter', true, null],
    ['ArrowLeft', true, 'back'],
    ['a', false, null],
  ] as const)('reads %s (on a control: %s)', (key, onControl, intent) => {
    expect(keyIntentOf(key, onControl)).toBe(intent);
  });
});

describe('isOverrunError', () => {
  it.each([
    [new ApiError({ kind: 'refused', status: 409, fields: [] }), true],
    [new ApiError({ kind: 'status', status: 409 }), true],
    [new ApiError({ kind: 'refused', status: 400, fields: [] }), false],
    [new Error('offline'), false],
    [null, false],
  ])('reads %o', (error, overrun) => {
    expect(isOverrunError(error)).toBe(overrun);
  });
});
