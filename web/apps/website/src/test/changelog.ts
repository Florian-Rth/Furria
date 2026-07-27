import { CHANGELOG_ENTRIES, writeReadEntryIds } from '@/features/changelog';

export const markChangelogSeen = (): void => {
  writeReadEntryIds(
    window.localStorage,
    CHANGELOG_ENTRIES.map((entry) => entry.id),
  );
};
