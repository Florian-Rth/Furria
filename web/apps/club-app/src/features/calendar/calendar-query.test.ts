import { describe, expect, it } from 'vitest';
import { parseMonthCursorParam, toCalendarPath, toScopeChoice } from './calendar-query';

describe('toScopeChoice', () => {
  it.each([
    ['all', { scope: 'all', groupId: null }],
    ['club', { scope: 'club', groupId: null }],
    ['group-7', { scope: 'group', groupId: 7 }],
    ['group-0', { scope: 'all', groupId: null }],
  ])('reads the chip %s as %o', (scopeId, expected) => {
    expect(toScopeChoice(scopeId)).toEqual(expected);
  });
});

describe('toCalendarPath', () => {
  it.each([
    [
      'no window and no group',
      { scope: 'all', groupId: null, from: null, to: null },
      '/api/calendar?scope=all',
    ],
    [
      'a group chip',
      { scope: 'group', groupId: 7, from: null, to: null },
      '/api/calendar?scope=group&groupId=7',
    ],
    [
      'a paged month window',
      { scope: 'club', groupId: null, from: '2026-02-01', to: '2026-02-28' },
      '/api/calendar?scope=club&from=2026-02-01&to=2026-02-28',
    ],
  ] as const)('asks for %s', (_case, query, expected) => {
    expect(toCalendarPath(query)).toBe(expected);
  });
});

describe('parseMonthCursorParam', () => {
  const fallback = new Date(2026, 8, 1);

  it.each([
    ['no month', undefined, fallback],
    ['a month that does not parse', 'not-a-month', fallback],
    ['a well-formed month', '2026-02', new Date(2026, 1, 1)],
  ])('reads %s', (_case, value, expected) => {
    expect(parseMonthCursorParam(value, fallback)).toEqual(expected);
  });
});
