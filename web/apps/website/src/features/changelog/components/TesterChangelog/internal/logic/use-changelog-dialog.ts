import { useEffect, useState } from 'react';
import { useChangelogReadStatus } from '@/features/changelog/hooks/use-changelog-read-status';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { resolveDialogInit } from './dialog-open-state';

interface ChangelogDialogState {
  entries: ChangelogEntry[];
  unreadCount: number;
  open: boolean;
  selectedEntry: ChangelogEntry | undefined;
  isUnread: (entryId: string) => boolean;
  selectEntry: (entryId: string) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useChangelogDialog = (): ChangelogDialogState => {
  const { entries, unreadCount, hasUnreadNewestEntry, isUnread, markRead } =
    useChangelogReadStatus();
  const [dialog, setDialog] = useState(() => resolveDialogInit(entries, hasUnreadNewestEntry));

  useEffect(() => {
    if (dialog.open && dialog.selectedEntryId !== null) {
      markRead(dialog.selectedEntryId);
    }
  }, [dialog, markRead]);

  return {
    entries,
    unreadCount,
    open: dialog.open,
    selectedEntry: entries.find((entry) => entry.id === dialog.selectedEntryId),
    isUnread,
    selectEntry: (entryId) => setDialog({ open: true, selectedEntryId: entryId }),
    openDialog: () => setDialog((current) => ({ ...current, open: true })),
    closeDialog: () => setDialog((current) => ({ ...current, open: false })),
  };
};
