import { describe, expect, it } from 'vitest';
import { toCalendarPath } from './calendar-query';

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
