import type { KkGroupTone } from '@furria/ui';
import { describe, expect, it } from 'vitest';
import { toCalendarMarks, toEntryTone } from './calendar-tones';

describe('toEntryTone', () => {
  it.each([
    { ownerGroupId: null, ownerGroupTone: null, expected: null },
    { ownerGroupId: 2, ownerGroupTone: 'rose' as KkGroupTone, expected: 'rose' },
    { ownerGroupId: 7, ownerGroupTone: null, expected: 'violet' },
  ])('reads $ownerGroupId / $ownerGroupTone as $expected', ({ expected, ...ownership }) => {
    expect(toEntryTone(ownership)).toBe(expected);
  });
});

describe('toCalendarMarks', () => {
  it('keeps the start and the resolved tone of every entry', () => {
    const marks = toCalendarMarks([
      { startsAt: '2026-02-14T19:00:00+01:00', ownerGroupId: null, ownerGroupTone: null },
      { startsAt: '2026-02-15T19:00:00+01:00', ownerGroupId: 2, ownerGroupTone: 'teal' },
    ]);

    expect(marks).toEqual([
      { startsAt: '2026-02-14T19:00:00+01:00', tone: null },
      { startsAt: '2026-02-15T19:00:00+01:00', tone: 'teal' },
    ]);
  });
});
