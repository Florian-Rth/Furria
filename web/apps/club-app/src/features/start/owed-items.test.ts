import { describe, expect, it } from 'vitest';
import { owesAnything, toAnswerItems, toOwedGroups, toOwedKeys, toOwedTally } from './owed-items';
import type { StartEntry } from './schemas';

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

describe('toAnswerItems', () => {
  it('puts the attendance first, then the functions in their order', () => {
    expect(toAnswerItems([meeting, answered, quiet]).map((item) => item.key)).toEqual([
      'attendance-1',
      'poll-12',
      'sign-up-list-21',
      'poll-11',
      'attendance-2',
      'sign-up-list-22',
    ]);
  });
});

describe('toOwedKeys', () => {
  it('keeps only what she still owes', () => {
    expect(toOwedKeys([meeting, answered, quiet])).toEqual([
      'attendance-1',
      'poll-12',
      'sign-up-list-21',
    ]);
  });
});

describe('toOwedTally', () => {
  it('counts owed and answered items', () => {
    expect(toOwedTally([meeting, answered, quiet])).toEqual({ owed: 3, answered: 3 });
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
  it('puts the items of one entry under one group', () => {
    const groups = toOwedGroups(toAnswerItems([meeting, answered]));

    expect(groups.map((group) => [group.key, group.items.map((item) => item.key)])).toEqual([
      [1, ['attendance-1', 'poll-12', 'sign-up-list-21', 'poll-11']],
      [2, ['attendance-2', 'sign-up-list-22']],
    ]);
  });
});
