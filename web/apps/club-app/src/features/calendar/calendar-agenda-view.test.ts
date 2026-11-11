import { describe, expect, it } from 'vitest';
import type { CalendarLine } from './calendar-agenda';
import { toAudienceLabel, toLineView } from './calendar-agenda-view';
import type { CalendarEntry } from './schemas';

const NOW_MS = Date.parse('2027-01-15T12:00:00Z');

const OPEN_POLL_ENTRY: CalendarEntry = {
  calendarEntryId: 7,
  title: 'Vereinsfahrt',
  startsAt: '2027-01-20T08:00:00Z',
  endsAt: '2027-01-21T18:00:00Z',
  kind: 'trip',
  venueId: null,
  venueName: null,
  ownerGroupId: null,
  ownerGroupName: null,
  ownerGroupTone: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  audiencePeople: [],
  asksForResponse: false,
  addOns: [],
  attendance: null,
  description: null,
  viewerAnswer: null,
  mayAnswer: true,
  openFunctions: [{ kind: 'poll', addOnId: 3, hasAnswered: false }],
  isRunning: false,
  event: null,
};

const lineOf = (entry: CalendarEntry, dayIndex: number): CalendarLine => ({
  key: `${entry.calendarEntryId}-${dayIndex}`,
  entry,
  dayIndex,
  dayCount: 2,
});

describe('toAudienceLabel', () => {
  it('names every audience group', () => {
    expect(
      toAudienceLabel({
        audience: 'groups',
        audienceGroups: [
          { groupId: 1, name: 'Tanzgarde', tone: null },
          { groupId: 2, name: 'Kindergarde', tone: null },
        ],
        audiencePeople: [],
      }),
    ).toBe('Tanzgarde, Kindergarde');
  });

  it('names every chosen person by full name', () => {
    expect(
      toAudienceLabel({
        audience: 'people',
        audienceGroups: [],
        audiencePeople: [
          { personId: 1, firstName: 'Bea', lastName: 'Garde' },
          { personId: 2, firstName: 'Kalle', lastName: 'Klein' },
        ],
      }),
    ).toBe('Bea Garde, Kalle Klein');
  });
});

describe('toLineView marks', () => {
  it.each([
    { dayIndex: 0, expected: ['vote'] },
    { dayIndex: 1, expected: [] },
  ])('marks day $dayIndex of the entry with $expected', ({ dayIndex, expected }) => {
    const view = toLineView(lineOf(OPEN_POLL_ENTRY, dayIndex), NOW_MS);

    expect(view.marks.map((mark) => mark.key)).toEqual(expected);
  });

  it('speaks a marked line differently from the same line without marks', () => {
    const marked = toLineView(lineOf(OPEN_POLL_ENTRY, 0), NOW_MS);
    const unmarked = toLineView(lineOf({ ...OPEN_POLL_ENTRY, openFunctions: [] }, 0), NOW_MS);

    expect(marked.spoken).not.toBe(unmarked.spoken);
  });
});
