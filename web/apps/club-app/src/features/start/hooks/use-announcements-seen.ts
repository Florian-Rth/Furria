import { useKkSheet } from '@furria/ui';
import { useEffect, useRef } from 'react';
import { useLastSeenAnnouncementMutation } from '@/features/announcements';
import type { StartAnnouncement } from '../schemas';
import { toSeenUpTo } from '../start-seen';
import { isAnnouncementsSheet } from '../start-sheets';

export const useAnnouncementsSeen = (
  announcements: readonly StartAnnouncement[],
  lastSeenAnnouncementAt: string | null | undefined,
): boolean => {
  const { openSheetId } = useKkSheet();
  const { mutate } = useLastSeenAnnouncementMutation();
  const sentUpTo = useRef<string | null>(null);
  const reading = isAnnouncementsSheet(openSheetId);
  const seenUpTo = toSeenUpTo(announcements, lastSeenAnnouncementAt);

  useEffect(() => {
    if (!reading || seenUpTo === null || sentUpTo.current === seenUpTo) {
      return;
    }

    sentUpTo.current = seenUpTo;
    mutate({ seenUpTo });
  }, [reading, seenUpTo, mutate]);

  return lastSeenAnnouncementAt !== undefined && seenUpTo === null;
};
