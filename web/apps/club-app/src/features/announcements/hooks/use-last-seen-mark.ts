import { useEffect, useRef } from 'react';
import { useAnnouncementsQuery, useLastSeenAnnouncementMutation } from '../api';
import { toNewestPublishedAt } from '../last-seen';

export const useLastSeenMark = (isRead: boolean): void => {
  const { mutate } = useLastSeenAnnouncementMutation();
  const { data } = useAnnouncementsQuery();
  const hasMarked = useRef(false);
  const seenUpTo = toNewestPublishedAt(data?.announcements ?? []);

  useEffect(() => {
    if (!isRead || hasMarked.current) {
      return;
    }

    hasMarked.current = true;
    mutate({ seenUpTo });
  }, [isRead, mutate, seenUpTo]);
};
