import { z } from 'zod';
import { CHANGELOG_ICON_KEYS } from './changelog-icons';

export const ChangelogEntrySchema = z.object({
  id: z.string().min(1),
  date: z.iso.date(),
  title: z.string().min(1),
  icon: z.enum(CHANGELOG_ICON_KEYS),
  description: z.array(z.string().min(1)).min(1),
});

export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;

export const ChangelogEntriesSchema = z.array(ChangelogEntrySchema);

export const ReadEntryIdsSchema = z.array(z.string());
