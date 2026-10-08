import { describe, expect, it } from 'vitest';
import {
  addReadEntryId,
  countUnreadEntries,
  isNewestEntryUnread,
  sortEntriesByDateDesc,
} from './read-state';
import type { ChangelogEntry } from './schemas';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'newspaper',
  description: ['Absatz'],
});

const entries = [
  entry('oldest', '2026-07-20'),
  entry('newest', '2026-07-26'),
  entry('middle', '2026-07-23'),
];

describe('sortEntriesByDateDesc', () => {
  it('sorts a copy of the log, newest first', () => {
    expect(sortEntriesByDateDesc(entries).map((sorted) => sorted.id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]);
    expect(entries.map((untouched) => untouched.id)).toEqual(['oldest', 'newest', 'middle']);
  });
});

describe('countUnreadEntries', () => {
  it.each([
    [[], 3],
    [['newest', 'oldest'], 1],
  ])('counts the entries left unread after reading %j: %i', (readEntryIds, unread) => {
    expect(countUnreadEntries(entries, readEntryIds)).toBe(unread);
  });
});

describe('isNewestEntryUnread', () => {
  it.each<[string, ChangelogEntry[], string[], boolean]>([
    ['the newest entry is unread', entries, ['oldest', 'middle'], true],
    ['only older entries are unread', entries, ['newest'], false],
    ['the log is empty', [], [], false],
  ])('when %s: %s', (_, log, readEntryIds, unread) => {
    expect(isNewestEntryUnread(log, readEntryIds)).toBe(unread);
  });
});

describe('addReadEntryId', () => {
  it.each([
    ['middle', ['newest', 'middle']],
    ['newest', ['newest']],
  ])('marks %s as read', (entryId, expected) => {
    expect(addReadEntryId(['newest'], entryId)).toEqual(expected);
  });
});
