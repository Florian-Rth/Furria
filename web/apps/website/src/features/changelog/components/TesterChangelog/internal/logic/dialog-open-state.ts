import type { ChangelogEntry } from '@/features/changelog/schemas';

export interface ChangelogDialogInit {
  open: boolean;
  selectedEntryId: string | null;
}

export const resolveDialogInit = (
  sortedEntries: ChangelogEntry[],
  hasUnreadNewestEntry: boolean,
): ChangelogDialogInit => {
  const newestEntry = sortedEntries[0];

  if (newestEntry === undefined) {
    return { open: false, selectedEntryId: null };
  }

  return { open: hasUnreadNewestEntry, selectedEntryId: newestEntry.id };
};
