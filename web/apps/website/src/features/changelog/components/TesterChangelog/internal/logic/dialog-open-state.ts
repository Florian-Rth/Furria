import type { ChangelogEntry } from '@/features/changelog/schemas';

export type ChangelogMobileView = 'list' | 'detail';

export interface ChangelogDialogState {
  open: boolean;
  selectedEntryId: string | null;
  mobileView: ChangelogMobileView;
}

export const resolveDialogInit = (
  sortedEntries: ChangelogEntry[],
  hasUnreadNewestEntry: boolean,
): ChangelogDialogState => {
  const newestEntry = sortedEntries[0];

  if (newestEntry === undefined) {
    return { open: false, selectedEntryId: null, mobileView: 'list' };
  }

  return {
    open: hasUnreadNewestEntry,
    selectedEntryId: newestEntry.id,
    mobileView: 'list',
  };
};

export const withDialogOpened = (state: ChangelogDialogState): ChangelogDialogState => ({
  ...state,
  open: true,
  mobileView: 'list',
});

export const withDialogClosed = (state: ChangelogDialogState): ChangelogDialogState => ({
  ...state,
  open: false,
});

export const withEntrySelected = (
  state: ChangelogDialogState,
  entryId: string,
): ChangelogDialogState => ({
  ...state,
  open: true,
  selectedEntryId: entryId,
  mobileView: 'detail',
});

export const withEntryListRestored = (state: ChangelogDialogState): ChangelogDialogState => ({
  ...state,
  mobileView: 'list',
});
