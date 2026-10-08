import { describe, expect, it } from 'vitest';
import type { Start, StartAnnouncement, StartEntry, StartMine, StartPanel } from './schemas';
import {
  focusedAnnouncementOf,
  isAnnouncementsSheet,
  isStrayStartSheet,
  newestFirst,
  parseStartSheet,
} from './start-sheets';

const entry = (calendarEntryId: number): StartEntry => ({
  calendarEntryId,
  title: 'Training',
  kind: 'training',
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
});

const announcement = (announcementId: number, publishedAt: string): StartAnnouncement => ({
  announcementId,
  title: 'Aushang',
  body: 'Text',
  publishedAt,
  validUntil: null,
  author: {
    personId: 1,
    firstName: 'Karin',
    lastName: 'Albrecht',
    portraitUrl: null,
    officeName: null,
  },
});

const mine = (kind: StartMine['kind'], subjectId: number): StartMine => ({
  kind,
  subjectId,
  on: '2027-01-18',
  until: '2027-01-31',
  name: 'Kassenwart',
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: null,
  permissionKeys: [],
});

const start = (panels: StartPanel[]): Start => ({
  asOf: '2027-01-19T18:50:00Z',
  today: '2027-01-19',
  reshapeAt: null,
  viewerIsActiveInClub: true,
  panels,
});

const board = start([
  { kind: 'calendar', shownCount: 1, entries: [entry(811)] },
  {
    kind: 'announcements',
    shownCount: 1,
    announcements: [announcement(12, '2027-01-18T09:00:00Z')],
  },
  { kind: 'mine', shownCount: 2, mine: [mine('newRole', 7), mine('newBoardSeat', 3)] },
]);

describe('parseStartSheet', () => {
  it.each<{ sheetId: string | null; expected: object | null }>([
    { sheetId: null, expected: null },
    { sheetId: 'start-calendar', expected: { kind: 'calendar' } },
    { sheetId: 'start-announcements', expected: { kind: 'announcements', announcementId: null } },
    { sheetId: 'start-announcements-12', expected: { kind: 'announcements', announcementId: 12 } },
    { sheetId: 'entry-811', expected: { kind: 'entry', calendarEntryId: 811 } },
    { sheetId: 'role-7', expected: { kind: 'role', roleId: 7 } },
    { sheetId: 'office-3', expected: { kind: 'office', boardOfficeId: 3 } },
    { sheetId: 'club-roles', expected: { kind: 'foreign' } },
  ])('reads $sheetId', ({ sheetId, expected }) => {
    expect(parseStartSheet(sheetId)).toEqual(expected);
  });
});

describe('isStrayStartSheet', () => {
  it.each<{ sheetId: string | null; expected: boolean }>([
    { sheetId: null, expected: false },
    { sheetId: 'entry-811', expected: false },
    { sheetId: 'entry-999', expected: true },
    { sheetId: 'start-calendar', expected: false },
    { sheetId: 'start-announcements', expected: false },
    { sheetId: 'start-announcements-12', expected: false },
    { sheetId: 'start-announcements-13', expected: true },
    { sheetId: 'role-7', expected: false },
    { sheetId: 'role-3', expected: true },
    { sheetId: 'office-3', expected: false },
    { sheetId: 'start-mine', expected: false },
    { sheetId: 'start-groups', expected: true },
    { sheetId: 'venue-2', expected: true },
  ])('treats $sheetId as stray: $expected', ({ sheetId, expected }) => {
    expect(isStrayStartSheet(sheetId, board)).toBe(expected);
  });
});

describe('isAnnouncementsSheet', () => {
  it.each([
    ['start-announcements', true],
    ['start-calendar', false],
    [null, false],
  ])('treats %s as the AUSHÄNGE sheet: %s', (sheetId, expected) => {
    expect(isAnnouncementsSheet(sheetId)).toBe(expected);
  });
});

describe('focusedAnnouncementOf', () => {
  it.each([
    ['start-announcements-12', 12],
    ['start-announcements', null],
    ['entry-12', null],
  ])('focuses %s on %s', (sheetId, expected) => {
    expect(focusedAnnouncementOf(sheetId)).toBe(expected);
  });
});

describe('newestFirst', () => {
  it('orders by publication, newest first, then by id', () => {
    const older = announcement(4, '2027-01-10T09:00:00Z');
    const newer = announcement(5, '2027-01-18T09:00:00Z');
    const twin = announcement(9, '2027-01-18T09:00:00Z');

    expect(newestFirst([older, newer, twin]).map((item) => item.announcementId)).toEqual([9, 5, 4]);
  });
});
