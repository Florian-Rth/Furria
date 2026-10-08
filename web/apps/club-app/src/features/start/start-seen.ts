import { toNewestPublishedAt } from '@/features/announcements/last-seen';
import type { StartAnnouncement } from './schemas';

export const toSeenUpTo = (
  announcements: readonly Pick<StartAnnouncement, 'publishedAt'>[],
  lastSeenAnnouncementAt: string | null | undefined,
): string | null => {
  const newest = toNewestPublishedAt(announcements);

  if (newest === null) {
    return null;
  }
  if (
    typeof lastSeenAnnouncementAt === 'string' &&
    Date.parse(newest) <= Date.parse(lastSeenAnnouncementAt)
  ) {
    return null;
  }

  return newest;
};
