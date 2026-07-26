import { useState } from 'react';
import { CHANGELOG_ENTRIES, sortEntriesByDateDesc } from '../changelog-content';
import { readReadEntryIds, writeReadEntryIds } from '../changelog-storage';
import {
  addReadEntryId,
  countUnreadEntries,
  isEntryRead,
  isNewestEntryUnread,
} from '../read-state';
import type { ChangelogEntry } from '../schemas';

interface ChangelogReadStatus {
  entries: ChangelogEntry[];
  unreadCount: number;
  hasUnreadNewestEntry: boolean;
  isUnread: (entryId: string) => boolean;
  markRead: (entryId: string) => void;
}

export const useChangelogReadStatus = (): ChangelogReadStatus => {
  const [readEntryIds, setReadEntryIds] = useState(() => readReadEntryIds(window.localStorage));

  const entries = sortEntriesByDateDesc(CHANGELOG_ENTRIES);

  const markRead = (entryId: string): void => {
    if (isEntryRead(readEntryIds, entryId)) {
      return;
    }

    const nextReadEntryIds = addReadEntryId(readEntryIds, entryId);

    writeReadEntryIds(window.localStorage, nextReadEntryIds);
    setReadEntryIds(nextReadEntryIds);
  };

  return {
    entries,
    unreadCount: countUnreadEntries(entries, readEntryIds),
    hasUnreadNewestEntry: isNewestEntryUnread(entries, readEntryIds),
    isUnread: (entryId) => !isEntryRead(readEntryIds, entryId),
    markRead,
  };
};
