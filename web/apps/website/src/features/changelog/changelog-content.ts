import changelogEntriesData from '@/content/changelog.json';
import type { ChangelogEntry } from './schemas';
import { ChangelogEntriesSchema } from './schemas';

export const CHANGELOG_ENTRIES: ChangelogEntry[] =
  ChangelogEntriesSchema.parse(changelogEntriesData);

export const sortEntriesByDateDesc = (entries: ChangelogEntry[]): ChangelogEntry[] =>
  [...entries].sort((first, second) => second.date.localeCompare(first.date));
