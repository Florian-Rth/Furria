import { sortEntriesByDateDesc } from './changelog-content';
import type { ChangelogEntry } from './schemas';

export const isEntryRead = (readEntryIds: string[], entryId: string): boolean =>
  readEntryIds.includes(entryId);

export const countUnreadEntries = (entries: ChangelogEntry[], readEntryIds: string[]): number =>
  entries.filter((entry) => !isEntryRead(readEntryIds, entry.id)).length;

export const isNewestEntryUnread = (entries: ChangelogEntry[], readEntryIds: string[]): boolean => {
  const newestEntry = sortEntriesByDateDesc(entries)[0];

  if (newestEntry === undefined) {
    return false;
  }

  return !isEntryRead(readEntryIds, newestEntry.id);
};

export const addReadEntryId = (readEntryIds: string[], entryId: string): string[] =>
  isEntryRead(readEntryIds, entryId) ? readEntryIds : [...readEntryIds, entryId];
