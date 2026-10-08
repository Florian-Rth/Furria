import { describe, expect, it } from 'vitest';
import type { EntryReach } from './calendar-labels';
import { entryReachOf, toScopeOptions } from './calendar-labels';
import type { CalendarEntry, CalendarEntryVisibility } from './schemas';

const entry = (overrides: Partial<CalendarEntry>): CalendarEntry => ({
  calendarEntryId: 1,
  title: 'Prunksitzung',
  startsAt: '2026-02-14T18:00:00.000Z',
  endsAt: null,
  kind: 'performance',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  visibility: 'club',
  asksForResponse: false,
  description: null,
  viewerAnswer: null,
  isRunning: false,
  event: null,
  ...overrides,
});

describe('entryReachOf', () => {
  it.each<[string, CalendarEntryVisibility, string | null, EntryReach | null]>([
    ['a club entry', 'club', null, null],
    ['a group-only entry', 'group', 'Garde', null],
    ['a group entry open to the whole club', 'club', 'Garde', 'wholeClub'],
    ['a public group entry', 'public', 'Garde', 'public'],
  ])('reads %s', (_case, visibility, ownerGroupName, expected) => {
    expect(entryReachOf(visibility, ownerGroupName)).toBe(expected);
  });
});

describe('toScopeOptions', () => {
  it('counts everything, the club-owned entries and every owning group once', () => {
    const options = toScopeOptions([
      entry({ calendarEntryId: 1 }),
      entry({ calendarEntryId: 2 }),
      entry({ calendarEntryId: 3, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 4, ownerGroupId: 3, ownerGroupName: 'Garde' }),
      entry({ calendarEntryId: 5, ownerGroupId: 1, ownerGroupName: 'Elferrat' }),
    ]);

    expect(options.map(({ id, count }) => ({ id, count }))).toEqual([
      { id: 'all', count: 5 },
      { id: 'club', count: 2 },
      { id: 'group-1', count: 1 },
      { id: 'group-3', count: 2 },
    ]);
  });
});
