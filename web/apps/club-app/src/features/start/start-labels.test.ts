import { describe, expect, it } from 'vitest';
import type { StartEntry } from './schemas';
import type { EntryFacet, EntryStamp } from './start-labels';
import {
  formatCountdownMinutes,
  formatShortDate,
  formatSpokenDay,
  formatSpokenTime,
  toEntryAccessibleName,
  toEntryFacets,
  toEntryTick,
  toRunningProgress,
  toStampOf,
} from './start-labels';

const at = (month: number, day: number, hour: number, minute = 0, second = 0): string =>
  new Date(2027, month - 1, day, hour, minute, second).toISOString();

const entry = (overrides: Partial<StartEntry> = {}): StartEntry => ({
  calendarEntryId: 811,
  title: 'Stellprobe',
  kind: 'rehearsal',
  startsAt: at(1, 21, 18),
  endsAt: at(1, 21, 21),
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

const TANZGARDE = { groupId: 4, name: 'Tanzgarde', tone: 'rose' } as const;
const ELFERRAT = { groupId: 2, name: 'Elferrat', tone: 'indigo' } as const;
const KINDERGARDE = { groupId: 6, name: 'Kindergarde', tone: 'teal' } as const;
const FESTHALLE = {
  venueId: 3,
  name: 'Festhalle Großfurra',
  street: 'Am Anger 1',
  zip: '99713',
  city: 'Großfurra',
  hint: null,
};

describe('toStampOf', () => {
  const tuesdayEvening = new Date(2027, 0, 19, 19, 50);
  const tuesdayMorning = new Date(2027, 0, 19, 8, 0);

  it.each<{
    label: string;
    timing: Pick<StartEntry, 'startsAt' | 'endsAt'>;
    now: Date;
    previousStartsAt: string | null;
    expected: Omit<EntryStamp, 'eyebrow'>;
  }>([
    {
      label: 'the training has begun',
      timing: { startsAt: at(1, 19, 19, 30), endsAt: at(1, 19, 21) },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'running', value: null, tone: 'live', time: '19:30' },
    },
    {
      label: 'an open-ended entry started under three hours ago',
      timing: { startsAt: at(1, 19, 17), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'running', value: null, tone: 'live', time: '17:00' },
    },
    {
      label: 'an open-ended entry started over three hours ago',
      timing: { startsAt: at(1, 19, 16, 49), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'today', value: null, tone: 'today', time: '16:49' },
    },
    {
      label: 'the entry starts in 100 minutes',
      timing: { startsAt: at(1, 19, 21, 30), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'countdown', value: '1:40', tone: 'today', time: '21:30' },
    },
    {
      label: 'the entry starts in half a minute',
      timing: { startsAt: at(1, 19, 19, 50, 30), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'countdown', value: '0:01', tone: 'today', time: '19:50' },
    },
    {
      label: 'the entry starts in 5 hours 59 minutes',
      timing: { startsAt: at(1, 19, 13, 59), endsAt: null },
      now: tuesdayMorning,
      previousStartsAt: null,
      expected: { kind: 'countdown', value: '5:59', tone: 'today', time: '13:59' },
    },
    {
      label: 'the entry starts in six hours',
      timing: { startsAt: at(1, 19, 14), endsAt: null },
      now: tuesdayMorning,
      previousStartsAt: null,
      expected: { kind: 'today', value: null, tone: 'today', time: '14:00' },
    },
    {
      label: 'the entry starts after midnight within the hour',
      timing: { startsAt: at(1, 20, 0, 30), endsAt: null },
      now: new Date(2027, 0, 19, 23, 50),
      previousStartsAt: null,
      expected: { kind: 'tomorrow', value: null, tone: 'plain', time: '00:30' },
    },
    {
      label: 'the entry is tomorrow',
      timing: { startsAt: at(1, 20, 18), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'tomorrow', value: null, tone: 'plain', time: '18:00' },
    },
    {
      label: 'the entry is on Thursday',
      timing: { startsAt: at(1, 21, 18), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'weekday', value: 'DO', tone: 'plain', time: '18:00' },
    },
    {
      label: 'the entry is six days ahead',
      timing: { startsAt: at(1, 25, 17), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'weekday', value: 'MO', tone: 'plain', time: '17:00' },
    },
    {
      label: 'the entry is a week ahead',
      timing: { startsAt: at(1, 26, 17), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'date', value: '26.1.', tone: 'plain', time: '17:00' },
    },
    {
      label: 'the entry is on Rosenmontag',
      timing: { startsAt: at(2, 8, 13, 11), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: null,
      expected: { kind: 'date', value: '8.2.', tone: 'plain', time: '13:11' },
    },
    {
      label: 'the line above lies on the same Thursday',
      timing: { startsAt: at(1, 21, 18), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: at(1, 21, 17),
      expected: { kind: 'ditto', value: null, tone: 'plain', time: '18:00' },
    },
    {
      label: 'the line above lies on another day',
      timing: { startsAt: at(1, 22, 18, 30), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: at(1, 21, 18),
      expected: { kind: 'weekday', value: 'FR', tone: 'plain', time: '18:30' },
    },
    {
      label: 'a line after midnight follows a line of the evening before',
      timing: { startsAt: at(1, 20, 1), endsAt: null },
      now: new Date(2027, 0, 19, 18, 0),
      previousStartsAt: at(1, 19, 17, 30),
      expected: { kind: 'tomorrow', value: null, tone: 'plain', time: '01:00' },
    },
    {
      label: 'an evening entry follows the running morning line',
      timing: { startsAt: at(1, 19, 18), endsAt: null },
      now: tuesdayMorning,
      previousStartsAt: at(1, 19, 7, 30),
      expected: { kind: 'ditto', value: null, tone: 'plain', time: '18:00' },
    },
    {
      label: 'a countdown follows a line of the same day',
      timing: { startsAt: at(1, 19, 21, 30), endsAt: null },
      now: tuesdayEvening,
      previousStartsAt: at(1, 19, 19, 30),
      expected: { kind: 'countdown', value: '1:40', tone: 'today', time: '21:30' },
    },
    {
      label: 'a running entry follows a line of the same day',
      timing: { startsAt: at(1, 19, 19, 30), endsAt: at(1, 19, 21) },
      now: tuesdayEvening,
      previousStartsAt: at(1, 19, 18),
      expected: { kind: 'running', value: null, tone: 'live', time: '19:30' },
    },
  ])('stamps $expected.kind when $label', ({ timing, now, previousStartsAt, expected }) => {
    expect(toStampOf(timing, now, previousStartsAt)).toMatchObject(expected);
  });
});

describe('formatCountdownMinutes', () => {
  it.each([
    [100, '1:40'],
    [359, '5:59'],
    [60, '1:00'],
    [5, '0:05'],
  ])('writes %d minutes as %s', (minutes, expected) => {
    expect(formatCountdownMinutes(minutes)).toBe(expected);
  });
});

describe('formatShortDate', () => {
  it.each([
    [at(1, 26, 17), '26.1.'],
    [at(2, 8, 13, 11), '8.2.'],
    [at(12, 11, 19), '11.12.'],
  ])('writes %s as %s', (instant, expected) => {
    expect(formatShortDate(instant)).toBe(expected);
  });
});

describe('formatSpokenDay', () => {
  it.each([
    [at(1, 21, 18), 'Donnerstag, 21. Januar'],
    [at(2, 8, 13, 11), 'Montag, 8. Februar'],
  ])('reads %s as %s', (instant, expected) => {
    expect(formatSpokenDay(instant)).toBe(expected);
  });
});

describe('formatSpokenTime', () => {
  it.each([
    [at(1, 21, 18), '18 Uhr'],
    [at(1, 21, 18, 30), '18:30 Uhr'],
    [at(1, 21, 9, 5), '9:05 Uhr'],
  ])('reads %s as %s', (instant, expected) => {
    expect(formatSpokenTime(instant)).toBe(expected);
  });
});

describe('toRunningProgress', () => {
  it.each([
    { label: 'the entry has no end', endsAt: null, now: new Date(2027, 0, 19, 20), expected: null },
    {
      label: 'half the training has passed',
      endsAt: at(1, 19, 21),
      now: new Date(2027, 0, 19, 20),
      expected: 0.5,
    },
    {
      label: 'the training has not begun',
      endsAt: at(1, 19, 21),
      now: new Date(2027, 0, 19, 18),
      expected: 0,
    },
    {
      label: 'the training is over',
      endsAt: at(1, 19, 21),
      now: new Date(2027, 0, 19, 22),
      expected: 1,
    },
    {
      label: 'the entry ends as it starts',
      endsAt: at(1, 19, 19),
      now: new Date(2027, 0, 19, 19),
      expected: null,
    },
  ])('is $expected when $label', ({ endsAt, now, expected }) => {
    expect(toRunningProgress({ startsAt: at(1, 19, 19), endsAt }, now)).toBe(expected);
  });
});

describe('toEntryFacets', () => {
  it.each<{ label: string; overrides: Partial<StartEntry>; expected: EntryFacet[] }>([
    { label: 'the entry is bare', overrides: {}, expected: [] },
    {
      label: 'the entry runs until nine',
      overrides: { isRunning: true, viewerRuns: { groupId: 6, function: 'Trainerin' } },
      expected: [{ kind: 'until', time: '21:00' }],
    },
    {
      label: 'she runs an open-ended entry that is running',
      overrides: {
        isRunning: true,
        endsAt: null,
        viewerRuns: { groupId: 6, function: 'Trainerin' },
      },
      expected: [{ kind: 'runs', function: 'Trainerin' }],
    },
    {
      label: 'she runs it as a group admin without a function',
      overrides: { viewerRuns: { groupId: 6, function: null } },
      expected: [{ kind: 'runs', function: null }],
    },
    {
      label: 'her group takes part',
      overrides: { participatingGroups: [TANZGARDE, ELFERRAT], viewerGroupIds: [4] },
      expected: [{ kind: 'with', group: TANZGARDE }],
    },
    {
      label: 'the title already names her group',
      overrides: {
        title: 'Sitzung Elferrat',
        participatingGroups: [ELFERRAT],
        viewerGroupIds: [2],
      },
      expected: [],
    },
    {
      label: 'the owner group is listed among the participants too',
      overrides: {
        ownerGroup: TANZGARDE,
        participatingGroups: [TANZGARDE],
        viewerGroupIds: [4],
      },
      expected: [],
    },
    {
      label: 'she holds the venue key',
      overrides: { venue: FESTHALLE, viewerHoldsVenueKey: true },
      expected: [{ kind: 'venue', name: 'Festhalle Großfurra', holdsKey: true }],
    },
    {
      label: 'every facet applies',
      overrides: {
        isRunning: true,
        participatingGroups: [KINDERGARDE, TANZGARDE],
        viewerGroupIds: [6, 4],
        viewerRuns: { groupId: 6, function: 'Trainerin' },
        venue: FESTHALLE,
      },
      expected: [
        { kind: 'until', time: '21:00' },
        { kind: 'with', group: KINDERGARDE },
        { kind: 'with', group: TANZGARDE },
        { kind: 'venue', name: 'Festhalle Großfurra', holdsKey: false },
      ],
    },
  ])('lists $expected.length facets when $label', ({ overrides, expected }) => {
    expect(toEntryFacets(entry(overrides))).toEqual(expected);
  });
});

describe('toEntryTick', () => {
  it.each<{ label: string; overrides: Partial<StartEntry>; expected: string | null }>([
    { label: 'the club owns the entry', overrides: {}, expected: null },
    {
      label: 'her group owns the entry',
      overrides: { title: 'Training', ownerGroup: KINDERGARDE, viewerGroupIds: [6] },
      expected: 'teal',
    },
    {
      label: 'the title names her owning group',
      overrides: { title: 'Sitzung elferrat', ownerGroup: ELFERRAT, viewerGroupIds: [2] },
      expected: null,
    },
    {
      label: 'another group owns the entry',
      overrides: { title: 'Training', ownerGroup: KINDERGARDE, viewerGroupIds: [4] },
      expected: null,
    },
    {
      label: 'her owning group has no tone',
      overrides: {
        title: 'Training',
        ownerGroup: { groupId: 6, name: 'Kindergarde', tone: null },
        viewerGroupIds: [6],
      },
      expected: null,
    },
  ])('ticks $expected when $label', ({ overrides, expected }) => {
    expect(toEntryTick(entry(overrides))).toBe(expected);
  });
});

describe('toEntryAccessibleName', () => {
  it('opens with the spoken day and hour, then the title and its facets', () => {
    const name = toEntryAccessibleName(
      entry({
        participatingGroups: [TANZGARDE],
        viewerGroupIds: [4],
        venue: FESTHALLE,
        attendance: { viewerAnswer: null, isOwed: true },
      }),
      new Date(2027, 0, 19, 19, 50),
    );

    expect(name.startsWith('Donnerstag, 21. Januar, 18 Uhr, Stellprobe, ')).toBe(true);
    expect(name).toContain('Tanzgarde');
    expect(name).toContain('Festhalle Großfurra');
  });

  it.each([
    {
      label: 'her own group that the tick shows',
      viewerGroupIds: [4],
      title: 'Training',
      says: true,
    },
    { label: 'a group she is not in', viewerGroupIds: [], title: 'Training', says: false },
    {
      label: 'a group the title already names',
      viewerGroupIds: [4],
      title: 'Training Tanzgarde',
      says: false,
    },
  ])('names the owner group for $label: $says', ({ viewerGroupIds, title, says }) => {
    const name = toEntryAccessibleName(
      entry({ title, ownerGroup: TANZGARDE, viewerGroupIds }),
      new Date(2027, 0, 19, 19, 50),
    );

    expect(name.replace(title, '').includes('Tanzgarde')).toBe(says);
  });

  it('speaks the start time of a running entry instead of its day', () => {
    const name = toEntryAccessibleName(
      entry({ startsAt: at(1, 19, 19, 30), endsAt: at(1, 19, 21), isRunning: true }),
      new Date(2027, 0, 19, 19, 50),
    );

    expect(name).toContain('19:30 Uhr, Stellprobe');
    expect(name).not.toContain('Dienstag');
  });
});
