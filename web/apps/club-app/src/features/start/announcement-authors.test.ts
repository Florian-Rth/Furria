import { describe, expect, it } from 'vitest';
import { authorGroupsOf, isUnread } from './announcement-authors';
import type { StartAnnouncement, StartPerson } from './schemas';

const frank: StartPerson = {
  personId: 1,
  firstName: 'Frank',
  lastName: 'Weber',
  portrait: null,
  officeName: 'Präsident',
};
const lena: StartPerson = { ...frank, personId: 2, firstName: 'Lena', officeName: null };

const announcement = (
  announcementId: number,
  publishedAt: string,
  author: StartPerson | null,
): StartAnnouncement => ({
  announcementId,
  title: 'Aushang',
  body: 'Text',
  publishedAt,
  validUntil: null,
  author,
});

const newest = announcement(3, '2026-10-18T10:00:00+02:00', frank);
const middle = announcement(2, '2026-10-15T10:00:00+02:00', lena);
const older = announcement(1, '2026-10-10T10:00:00+02:00', frank);
const unsigned = announcement(4, '2026-10-09T10:00:00+02:00', null);

describe('isUnread', () => {
  it.each([
    [undefined, false],
    [null, true],
    ['2026-10-12T00:00:00+02:00', true],
    ['2026-10-18T10:00:00+02:00', false],
  ])('judges the newest against last seen %s', (lastSeen, expected) => {
    expect(isUnread(newest, lastSeen)).toBe(expected);
  });
});

describe('authorGroupsOf', () => {
  it('names each author once in order of their newest note', () => {
    expect(
      authorGroupsOf([newest, middle, older, unsigned]).map((group) => [
        group.key,
        group.announcements.map((item) => item.announcementId),
      ]),
    ).toEqual([
      ['1', [3, 1]],
      ['2', [2]],
      ['unsigned', [4]],
    ]);
  });
});
