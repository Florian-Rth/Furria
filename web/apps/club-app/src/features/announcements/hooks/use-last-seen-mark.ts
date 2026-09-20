import { useEffect, useRef } from 'react';
import { useLastSeenAnnouncementMutation } from '../api';

export const useLastSeenMark = (isRead: boolean): void => {
  const { mutate } = useLastSeenAnnouncementMutation();
  const hasMarked = useRef(false);

  useEffect(() => {
    if (!isRead || hasMarked.current) {
      return;
    }

    hasMarked.current = true;
    mutate();
  }, [isRead, mutate]);
};
