import { describe, expect, it } from 'vitest';
import type { EntryReach } from './calendar-labels';
import {
  entryReachOf,
  toScopeOptions,
  toStartDayQuickChoices,
  toUnloadedScopeOptions,
} from './calendar-labels';
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

describe('toUnloadedScopeOptions', () => {
  it.each<{
    label: string;
    scopeId: string;
    known: { id: string; label: string; count?: number }[] | null;
    expected: { id: string; count: number | undefined }[];
  }>([
    {
      label: 'nothing was ever loaded',
      scopeId: 'all',
      known: null,
      expected: [
        { id: 'all', count: undefined },
        { id: 'club', count: undefined },
      ],
    },
    {
      label: 'the chosen group was never loaded',
      scopeId: 'group-7',
      known: null,
      expected: [
        { id: 'all', count: undefined },
        { id: 'club', count: undefined },
        { id: 'group-7', count: undefined },
      ],
    },
    {
      label: 'an earlier month named the groups',
      scopeId: 'group-3',
      known: [
        { id: 'all', label: 'Alle', count: 4 },
        { id: 'club', label: 'Verein', count: 1 },
        { id: 'group-3', label: 'Garde', count: 3 },
      ],
      expected: [
        { id: 'all', count: undefined },
        { id: 'club', count: undefined },
        { id: 'group-3', count: undefined },
      ],
    },
  ])('keeps every scope without stale counts when $label', ({ scopeId, known, expected }) => {
    const options = toUnloadedScopeOptions(scopeId, known);

    expect(options.map(({ id, count }) => ({ id, count }))).toEqual(expected);
  });
});

describe('toStartDayQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 13), expected: ['2026-10-13', '2026-10-14'] },
    { today: new Date(2026, 9, 31), expected: ['2026-10-31', '2026-11-01'] },
    { today: new Date(2026, 11, 31), expected: ['2026-12-31', '2027-01-01'] },
  ])('offers today and the following day for $today', ({ today, expected }) => {
    expect(toStartDayQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});
