import { useEffect, useState } from 'react';
import { useChangelogReadStatus } from '@/features/changelog/hooks/use-changelog-read-status';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import type { ChangelogMobileView } from './dialog-open-state';
import {
  resolveDialogInit,
  withDialogClosed,
  withDialogOpened,
  withEntryListRestored,
  withEntrySelected,
} from './dialog-open-state';

interface ChangelogDialogControls {
  entries: ChangelogEntry[];
  unreadCount: number;
  open: boolean;
  selectedEntry: ChangelogEntry | undefined;
  mobileView: ChangelogMobileView;
  isUnread: (entryId: string) => boolean;
  selectEntry: (entryId: string) => void;
  showEntryList: () => void;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useChangelogDialog = (): ChangelogDialogControls => {
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
    mobileView: dialog.mobileView,
    isUnread,
    selectEntry: (entryId) => setDialog((current) => withEntrySelected(current, entryId)),
    showEntryList: () => setDialog(withEntryListRestored),
    openDialog: () => setDialog(withDialogOpened),
    closeDialog: () => setDialog(withDialogClosed),
  };
};
