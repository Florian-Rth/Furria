import { describe, expect, it } from 'vitest';
import { addReadEntryId, countUnreadEntries, isEntryRead, isNewestEntryUnread } from './read-state';
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

describe('isEntryRead', () => {
  it('treats an unknown id as unread', () => {
    expect(isEntryRead(['newest'], 'middle')).toBe(false);
  });

  it('reports a stored id as read', () => {
    expect(isEntryRead(['newest'], 'newest')).toBe(true);
  });
});

describe('countUnreadEntries', () => {
  it('counts every entry when nothing has been read', () => {
    expect(countUnreadEntries(entries, [])).toBe(3);
  });

  it('counts only the entries that are still unread', () => {
    expect(countUnreadEntries(entries, ['newest', 'oldest'])).toBe(1);
  });

  it('ignores read ids that no longer exist in the log', () => {
    expect(countUnreadEntries(entries, ['website-p0-frontend'])).toBe(3);
  });
});

describe('isNewestEntryUnread', () => {
  it('is true while the entry with the newest date is unread', () => {
    expect(isNewestEntryUnread(entries, ['oldest', 'middle'])).toBe(true);
  });

  it('is false once the newest entry is read, even with older ones unread', () => {
    expect(isNewestEntryUnread(entries, ['newest'])).toBe(false);
  });

  it('is false for an empty log', () => {
    expect(isNewestEntryUnread([], [])).toBe(false);
  });
});

describe('addReadEntryId', () => {
  it('appends an id that was not read yet', () => {
    expect(addReadEntryId(['newest'], 'middle')).toEqual(['newest', 'middle']);
  });

  it('stays unchanged for an already read id', () => {
    expect(addReadEntryId(['newest'], 'newest')).toEqual(['newest']);
  });

  it('leaves the input array untouched', () => {
    const readEntryIds = ['newest'];

    addReadEntryId(readEntryIds, 'middle');

    expect(readEntryIds).toEqual(['newest']);
  });
});
