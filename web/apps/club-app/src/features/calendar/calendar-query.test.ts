import { describe, expect, it } from 'vitest';
import {
  parseMonthCursorParam,
  toCalendarPath,
  toMonthCursorParam,
  toScopeChoice,
} from './calendar-query';

describe('toScopeChoice', () => {
  it.each([
    ['all', { scope: 'all', groupId: null }],
    ['club', { scope: 'club', groupId: null }],
    ['group-7', { scope: 'group', groupId: 7 }],
    ['group-0', { scope: 'all', groupId: null }],
    ['group-', { scope: 'all', groupId: null }],
    ['garden', { scope: 'all', groupId: null }],
  ])('reads the chip %s as %o', (scopeId, expected) => {
    expect(toScopeChoice(scopeId)).toEqual(expected);
  });
});

describe('toCalendarPath', () => {
  it('asks for everything when no window and no group is chosen', () => {
    expect(toCalendarPath({ scope: 'all', groupId: null, from: null, to: null })).toBe(
      '/api/calendar?scope=all',
    );
  });

  it('carries the group when a group chip is chosen', () => {
    expect(toCalendarPath({ scope: 'group', groupId: 7, from: null, to: null })).toBe(
      '/api/calendar?scope=group&groupId=7',
    );
  });

  it('carries the month window when the grid is paged', () => {
    expect(
      toCalendarPath({ scope: 'club', groupId: null, from: '2026-02-01', to: '2026-02-28' }),
    ).toBe('/api/calendar?scope=club&from=2026-02-01&to=2026-02-28');
  });
});

describe('toMonthCursorParam', () => {
  it.each([
    [new Date(2026, 1, 14), '2026-02'],
    [new Date(2026, 10, 1), '2026-11'],
  ])('reads %s as %s', (cursor, expected) => {
    expect(toMonthCursorParam(cursor)).toBe(expected);
  });
});

describe('parseMonthCursorParam', () => {
  const fallback = new Date(2026, 8, 1);

  it('falls back when no month is given', () => {
    expect(parseMonthCursorParam(undefined, fallback)).toEqual(fallback);
  });

  it('falls back when the month does not parse', () => {
    expect(parseMonthCursorParam('not-a-month', fallback)).toEqual(fallback);
  });

  it('reads a well-formed month back to its first day', () => {
    expect(parseMonthCursorParam('2026-02', fallback)).toEqual(new Date(2026, 1, 1));
  });
});
