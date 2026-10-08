import { describe, expect, it } from 'vitest';
import type { StartEntry, StartMine } from './schemas';
import type { MineLineContext, PastDayKind } from './start-lines';
import {
  isRoundYears,
  joinDayOf,
  pastDayKindOf,
  toAnnouncementLineState,
  toCalendarTick,
  toEntryLineState,
  toEntryMeta,
  toEntryTrailing,
  toMineLine,
} from './start-lines';

const mine = (overrides: Partial<StartMine>): StartMine => ({
  kind: 'newRole',
  subjectId: 7,
  on: '2027-01-18',
  until: '2027-01-31',
  name: 'Kassenwart',
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: null,
  permissionKeys: null,
  ...overrides,
});

const entry = (overrides: Partial<StartEntry>): StartEntry => ({
  calendarEntryId: 811,
  title: 'Stellprobe',
  kind: 'rehearsal',
  startsAt: '2027-01-21T17:00:00Z',
  endsAt: null,
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

const MEMBER: MineLineContext = { today: '2027-01-19', canReadClub: true, memberSince: null };

describe('pastDayKindOf', () => {
  it.each<[string, PastDayKind]>([
    ['2027-01-19', 'today'],
    ['2027-01-18', 'yesterday'],
    ['2027-01-17', 'earlier'],
    ['2026-12-31', 'earlier'],
  ])('names %s relative to Tuesday 19.1.2027 as %s', (isoDay, expected) => {
    expect(pastDayKindOf(isoDay, '2027-01-19')).toBe(expected);
  });
});

describe('isRoundYears', () => {
  it.each([
    [11, true],
    [25, true],
    [7, false],
    [0, false],
  ])('celebrates %i years: %s', (value, expected) => {
    expect(isRoundYears(value)).toBe(expected);
  });
});

describe('joinDayOf', () => {
  it.each<{ label: string; memberSince: string | null; expected: string }>([
    { label: 'the membership start is known', memberSince: '1994-03-01', expected: '1994-03-01' },
    { label: 'only the anniversary is known', memberSince: null, expected: '2002-03-01' },
  ])('is $expected when $label', ({ memberSince, expected }) => {
    const milestone = mine({ kind: 'milestone', subjectId: null, on: '2027-03-01', years: 25 });

    expect(joinDayOf(milestone, memberSince)).toBe(expected);
  });
});

describe('toMineLine', () => {
  it.each<{ label: string; item: StartMine; context: MineLineContext; target: object }>([
    {
      label: 'a new role opens its sheet',
      item: mine({ kind: 'newRole', subjectId: 7 }),
      context: MEMBER,
      target: { kind: 'sheet', sheetId: 'role-7' },
    },
    {
      label: 'a new group membership leads to the group',
      item: mine({ kind: 'newGroupMembership', subjectId: 4 }),
      context: MEMBER,
      target: { kind: 'route', to: '/groups/$groupId', params: { groupId: '4' } },
    },
    {
      label: 'a new key leads to its venue sheet on the club page',
      item: mine({ kind: 'newKey', subjectId: 2 }),
      context: MEMBER,
      target: { kind: 'route', to: '/club', search: { sheet: 'venue-2' } },
    },
    {
      label: 'a new key stays inert without club reading',
      item: mine({ kind: 'newKey', subjectId: 2 }),
      context: { ...MEMBER, canReadClub: false },
      target: { kind: 'none' },
    },
  ])('$label', ({ item, context, target }) => {
    expect(toMineLine(item, context).target).toMatchObject(target);
  });
});

describe('toEntryMeta', () => {
  const venue = {
    venueId: 3,
    name: 'Sporthalle Am Ring',
    street: null,
    zip: null,
    city: null,
    hint: null,
  };

  it('marks the venue with the key when she holds one and lets its name truncate', () => {
    const [facet] = toEntryMeta(entry({ venue, viewerHoldsVenueKey: true }));

    expect(facet).toEqual({ text: 'Sporthalle Am Ring', icon: 'key', truncates: true });
  });

  it('keeps the run state whole', () => {
    const [facet] = toEntryMeta(
      entry({ venue, viewerRuns: { groupId: 6, function: 'Trainerin' } }),
    );

    expect(facet?.truncates).toBeUndefined();
  });
});

describe('toCalendarTick', () => {
  const owner = { groupId: 4, name: 'Tanzgarde', tone: null };

  it('ticks a toneless owner group of hers with its fallback tone', () => {
    expect(toCalendarTick(entry({ ownerGroup: owner, viewerGroupIds: [4] }))).not.toBeNull();
  });

  it('leaves a club-owned entry without a tick', () => {
    expect(toCalendarTick(entry({ viewerGroupIds: [4] }))).toBeNull();
  });
});

describe('toEntryTrailing', () => {
  it.each<{ label: string; attendance: StartEntry['attendance']; expected: object }>([
    { label: 'the entry asks nothing', attendance: null, expected: { kind: 'none' } },
    {
      label: 'her answer is owed',
      attendance: { viewerAnswer: null, isOwed: true },
      expected: { kind: 'ring' },
    },
    {
      label: 'she may answer but owes nothing',
      attendance: { viewerAnswer: null, isOwed: false },
      expected: { kind: 'none' },
    },
    {
      label: 'she answered maybe',
      attendance: { viewerAnswer: 'maybe', isOwed: false },
      expected: { kind: 'mark', answer: 'maybe' },
    },
  ])('shows $expected.kind when $label', ({ attendance, expected }) => {
    expect(toEntryTrailing(attendance)).toEqual(expected);
  });
});

describe('toEntryLineState', () => {
  it.each([
    { running: true, dimmed: true, expected: 'dimmed' },
    { running: true, dimmed: false, expected: 'live' },
    { running: false, dimmed: false, expected: 'plain' },
  ])('is $expected when running $running and dimmed $dimmed', ({ running, dimmed, expected }) => {
    expect(toEntryLineState(running, dimmed)).toBe(expected);
  });
});

describe('toAnnouncementLineState', () => {
  it.each([
    {
      label: 'she read them and a refetch left them out',
      read: true,
      dimmed: true,
      expected: 'read',
    },
    { label: 'a refetch left out an unread one', read: false, dimmed: true, expected: 'dimmed' },
    { label: 'it is new and still there', read: false, dimmed: false, expected: 'plain' },
  ])('is $expected when $label', ({ read, dimmed, expected }) => {
    expect(toAnnouncementLineState(read, dimmed)).toBe(expected);
  });
});
