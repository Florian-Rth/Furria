import { describe, expect, it } from 'vitest';
import {
  owesAnything,
  toAnswerItems,
  toHostItemKey,
  toOwedGroups,
  toOwedKeys,
  toOwedTally,
} from './owed-items';
import type { StartAnnouncementAddOns, StartEntry } from './schemas';

const entry = (calendarEntryId: number, overrides: Partial<StartEntry> = {}): StartEntry => ({
  calendarEntryId,
  title: 'Vereinssitzung',
  kind: 'plain',
  startsAt: '2026-11-20T19:00:00+01:00',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance: null,
  openPolls: [],
  openSignUpLists: [],
  description: null,
  event: null,
  ...overrides,
});

const poll = (
  pollId: number,
  position: number,
  isOwed: boolean,
): StartEntry['openPolls'][number] => ({
  pollId,
  position,
  question: 'Was essen wir?',
  allowsMultipleChoices: false,
  isAnonymous: false,
  isOwed,
  options: [],
});

const list = (
  signUpListId: number,
  position: number,
  isOwed: boolean,
): StartEntry['openSignUpLists'][number] => ({
  signUpListId,
  position,
  title: 'Mitbringen',
  hint: null,
  isOwed,
  viewerText: isOwed ? null : 'Salat',
});

const meeting = entry(1, {
  attendance: { viewerAnswer: null, isOwed: true },
  openPolls: [poll(11, 3, false), poll(12, 1, true)],
  openSignUpLists: [list(21, 2, true)],
});
const answered = entry(2, {
  attendance: { viewerAnswer: 'yes', isOwed: false },
  openSignUpLists: [list(22, 1, false)],
});
const quiet = entry(3, { attendance: { viewerAnswer: null, isOwed: false } });

const announcement = (
  announcementId: number,
  overrides: Partial<StartAnnouncementAddOns> = {},
): StartAnnouncementAddOns => ({
  announcementId,
  title: 'Sommerfest',
  publishedAt: '2026-11-18T09:00:00+01:00',
  attendance: null,
  openPolls: [],
  openSignUpLists: [],
  ...overrides,
});

const festival = announcement(1, {
  attendance: { position: 2, viewerAnswer: null, isOwed: true },
  openPolls: [poll(31, 0, false)],
  openSignUpLists: [list(41, 1, true)],
});

const entriesOnly = { entries: [meeting, answered, quiet], announcements: [] };

describe('toAnswerItems', () => {
  it('puts the attendance first, then the functions in their order', () => {
    expect(toAnswerItems(entriesOnly).map((item) => item.key)).toEqual([
      'attendance-1',
      'poll-12',
      'sign-up-list-21',
      'poll-11',
      'attendance-2',
      'sign-up-list-22',
    ]);
  });

  it('puts announcements after the entries, each in the order its author set', () => {
    expect(
      toAnswerItems({ entries: [answered], announcements: [festival] }).map((item) => item.key),
    ).toEqual([
      'attendance-2',
      'sign-up-list-22',
      'poll-31',
      'sign-up-list-41',
      'announcement-attendance-1',
    ]);
  });

  it('keeps an entry attendance and an announcement attendance of the same id apart', () => {
    const keys = toAnswerItems({ entries: [meeting], announcements: [festival] }).map(
      (item) => item.key,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('toOwedKeys', () => {
  it('keeps only what she still owes', () => {
    expect(toOwedKeys(entriesOnly)).toEqual(['attendance-1', 'poll-12', 'sign-up-list-21']);
  });
});

describe('toOwedTally', () => {
  it('counts owed and answered items', () => {
    expect(toOwedTally(entriesOnly)).toEqual({ owed: 3, answered: 3 });
  });

  it('counts the announcement add-ons along with the entries', () => {
    expect(toOwedTally({ entries: [answered], announcements: [festival] })).toEqual({
      owed: 2,
      answered: 3,
    });
  });
});

describe('owesAnything', () => {
  it.each([
    [meeting, true],
    [answered, false],
    [quiet, false],
    [entry(4, { openPolls: [poll(13, 0, true)] }), true],
    [entry(5, { openSignUpLists: [list(23, 0, true)] }), true],
  ])('decides for entry %#', (subject, expected) => {
    expect(owesAnything(subject)).toBe(expected);
  });
});

describe('toOwedGroups', () => {
  it('puts the items of one entry or announcement under one group', () => {
    const groups = toOwedGroups(
      toAnswerItems({ entries: [meeting, answered], announcements: [festival] }),
    );

    expect(groups.map((group) => [group.key, group.items.map((item) => item.key)])).toEqual([
      ['entry-1', ['attendance-1', 'poll-12', 'sign-up-list-21', 'poll-11']],
      ['entry-2', ['attendance-2', 'sign-up-list-22']],
      ['announcement-1', ['poll-31', 'sign-up-list-41', 'announcement-attendance-1']],
    ]);
  });
});

describe('toHostItemKey', () => {
  it.each([
    [toAnswerItems({ entries: [meeting], announcements: [] })[0], 'calendar:1'],
    [toAnswerItems({ entries: [], announcements: [festival] })[0], 'announcementAddOns:1'],
  ])('keys the host of item %# like its Start line', (item, expected) => {
    expect(item === undefined ? null : toHostItemKey(item.host)).toBe(expected);
  });
});
