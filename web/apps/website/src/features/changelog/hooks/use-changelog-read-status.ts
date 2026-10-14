import { useState } from 'react';
import { safeLocalStorage } from '@/lib/browser-storage';
import { CHANGELOG_ENTRIES } from '../changelog-content';
import { readReadEntryIds, writeReadEntryIds } from '../changelog-storage';
import {
  addReadEntryId,
  countUnreadEntries,
  isEntryRead,
  isNewestEntryUnread,
  sortEntriesByDateDesc,
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
  const [readEntryIds, setReadEntryIds] = useState(() => readReadEntryIds(safeLocalStorage));

  const entries = sortEntriesByDateDesc(CHANGELOG_ENTRIES);

  const markRead = (entryId: string): void => {
    if (isEntryRead(readEntryIds, entryId)) {
      return;
    }

    const nextReadEntryIds = addReadEntryId(readEntryIds, entryId);

    writeReadEntryIds(safeLocalStorage, nextReadEntryIds);
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
