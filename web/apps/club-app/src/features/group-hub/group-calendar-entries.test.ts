import { describe, expect, it } from 'vitest';
import { toCalendarEntryMark, toCalendarEntryWindow } from './group-calendar-entries';
import type { GroupCalendarEntry } from './schemas';

const anEntry = (overrides: Partial<GroupCalendarEntry>): GroupCalendarEntry => ({
  calendarEntryId: 1,
  title: 'Prunksitzung',
  startsAt: '2027-02-06T18:00:00.000Z',
  endsAt: '2027-02-06T22:00:00.000Z',
  kind: 'meeting',
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
  viewerMayAnswer: false,
  isRunning: false,
  ...overrides,
});

describe('toCalendarEntryWindow', () => {
  it.each([
    [new Date(2027, 0, 1), '2027-01-01', '2027-06-30'],
    [new Date(2027, 11, 31), '2027-12-31', '2028-06-28'],
  ])('spans half a year from %s', (today, from, to) => {
    expect(toCalendarEntryWindow(today)).toEqual({ from, to });
  });
});

describe('toCalendarEntryMark', () => {
  it.each<[string, Partial<GroupCalendarEntry>, string | null]>([
    ['a running entry of the group itself', { isRunning: true, ownerGroupId: 7 }, 'running'],
    ['the group’s own entry', { ownerGroupId: 7 }, null],
    ['a club-owned entry', { ownerGroupId: null }, 'guestOfClub'],
    [
      'another group’s entry',
      { ownerGroupId: 8, ownerGroupName: 'Kindergarde', ownerGroupTone: 'teal' },
      'guestOfGroup',
    ],
  ])('marks %s', (_case, entry, expected) => {
    expect(toCalendarEntryMark(anEntry(entry), 7)?.kind ?? null).toBe(expected);
  });

  it('carries the owning group’s stored tone', () => {
    const mark = toCalendarEntryMark(
      anEntry({ ownerGroupId: 8, ownerGroupName: 'Kindergarde', ownerGroupTone: 'teal' }),
      7,
    );

    expect(mark?.kind === 'guestOfGroup' ? mark.tone : null).toBe('teal');
  });
});
