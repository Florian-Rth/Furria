import { describe, expect, it } from 'vitest';
import type { EntryRunning, EntryRuns } from './entry-sheet';
import {
  entryRunningOf,
  entryRunsOf,
  formatEntrySpan,
  toEntryGroups,
  toEntryOnward,
  toEntryVenue,
} from './entry-sheet';
import type { StartEntry } from './schemas';

type EntryTiming = Pick<StartEntry, 'startsAt' | 'endsAt'>;

const at = (month: number, day: number, hour: number, minute = 0): string =>
  new Date(2027, month - 1, day, hour, minute).toISOString();

const entry = (overrides: Partial<StartEntry>): StartEntry => ({
  calendarEntryId: 905,
  title: 'Prunksitzung',
  kind: 'performance',
  startsAt: at(1, 23, 19, 11),
  endsAt: at(1, 23, 23, 30),
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: null,
  description: null,
  ...overrides,
});

const KINDERGARDE = { groupId: 6, name: 'Kindergarde', tone: 'teal' } as const;
const TANZGARDE = { groupId: 4, name: 'Tanzgarde', tone: 'rose' } as const;

describe('formatEntrySpan', () => {
  it.each([
    {
      label: 'ends the same evening',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: at(1, 23, 23, 30) },
      expected: 'Samstag, 23. Januar · 19:11–23:30',
    },
    {
      label: 'has no end',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: null },
      expected: 'Samstag, 23. Januar · 19:11',
    },
    {
      label: 'ends after midnight',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: at(1, 24, 2, 0) },
      expected: 'Samstag, 23. Januar · 19:11–24.1. 02:00',
    },
  ])('formats an entry that $label', ({ timing, expected }) => {
    expect(formatEntrySpan(timing)).toBe(expected);
  });
});

describe('entryRunningOf', () => {
  it.each<{ label: string; timing: EntryTiming; now: Date; expected: EntryRunning }>([
    {
      label: 'before the start',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: at(1, 23, 23, 30) },
      now: new Date(2027, 0, 23, 19, 0),
      expected: { kind: 'idle' },
    },
    {
      label: 'while it runs',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: at(1, 23, 23, 30) },
      now: new Date(2027, 0, 23, 20, 0),
      expected: { kind: 'ending', minutesLeft: 210 },
    },
    {
      label: 'in its last seconds',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: at(1, 23, 23, 30) },
      now: new Date(2027, 0, 23, 23, 29, 30),
      expected: { kind: 'ending', minutesLeft: 1 },
    },
    {
      label: 'while an open-ended entry runs',
      timing: { startsAt: at(1, 23, 19, 11), endsAt: null },
      now: new Date(2027, 0, 23, 20, 0),
      expected: { kind: 'openEnded' },
    },
  ])('is $expected.kind $label', ({ timing, now, expected }) => {
    expect(entryRunningOf(timing, now)).toEqual(expected);
  });
});

describe('toEntryVenue', () => {
  it('lists street, place and hint, leaving out blanks', () => {
    const venue = toEntryVenue(
      {
        venueId: 3,
        name: 'Festhalle Großfurra',
        street: 'Am Anger 1',
        zip: '99706',
        city: 'Großfurra',
        hint: '  ',
      },
      true,
    );

    expect(venue).toEqual({
      name: 'Festhalle Großfurra',
      lines: ['Am Anger 1', '99706 Großfurra'],
      holdsKey: true,
    });
  });
});

describe('toEntryGroups', () => {
  it('separates the owner from the participating groups', () => {
    const groups = toEntryGroups(
      entry({ ownerGroup: KINDERGARDE, participatingGroups: [KINDERGARDE, TANZGARDE] }),
    );

    expect(groups).toEqual({ owner: KINDERGARDE, participating: [TANZGARDE] });
  });
});

describe('entryRunsOf', () => {
  it.each<{ label: string; shown: StartEntry; expected: EntryRuns | null }>([
    { label: 'she does not run the entry', shown: entry({}), expected: null },
    {
      label: 'she runs it for its owner with a function',
      shown: entry({ ownerGroup: KINDERGARDE, viewerRuns: { groupId: 6, function: 'Trainerin' } }),
      expected: { groupName: 'Kindergarde', duty: 'Trainerin' },
    },
    {
      label: 'she runs it for a participating group with a blank function',
      shown: entry({ participatingGroups: [TANZGARDE], viewerRuns: { groupId: 4, function: ' ' } }),
      expected: { groupName: 'Tanzgarde', duty: null },
    },
    {
      label: 'she runs it for a group the entry does not name',
      shown: entry({ viewerRuns: { groupId: 9, function: null } }),
      expected: { groupName: null, duty: null },
    },
  ])('reads $label', ({ shown, expected }) => {
    expect(entryRunsOf(shown)).toEqual(expected);
  });
});

describe('toEntryOnward', () => {
  it('leads to the day in the calendar when she reads the club', () => {
    expect(toEntryOnward(entry({}), true)).toEqual({ kind: 'calendar', day: '2027-01-23' });
  });

  it('leads to her first group without club reading', () => {
    const onward = toEntryOnward(
      entry({ ownerGroup: KINDERGARDE, participatingGroups: [TANZGARDE], viewerGroupIds: [4] }),
      false,
    );

    expect(onward).toEqual({ kind: 'group', groupId: 4, name: 'Tanzgarde' });
  });

  it('offers nothing when no group of hers is named', () => {
    expect(toEntryOnward(entry({}), false)).toEqual({ kind: 'none' });
  });
});
