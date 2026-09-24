import type { FC } from 'react';
import { AppListSkeleton, useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ANNOUNCEMENTS_LOADING_LABEL } from '../announcements-labels';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { useAnnouncementsQuery } from '../api';
import { useLastSeenMark } from '../hooks/use-last-seen-mark';
import { useSeenBaseline } from '../hooks/use-seen-baseline';
import { AnnouncementsError } from './AnnouncementsError';
import { AnnouncementsList } from './AnnouncementsList';

interface AnnouncementsBodyProps {
  highlightedKey: string | null;
}

export const AnnouncementsBody: FC<AnnouncementsBodyProps> = ({ highlightedKey }) => {
  const announcements = useAnnouncementsQuery();
  const me = useMeQuery();
  const { has } = usePermissions();
  const lastSeenAt = useSeenBaseline(me.data?.lastSeenAnnouncementAt);
  const mayPost = has(PERMISSION_KEYS.announcementsPost);
  const errorMessage = toAnnouncementsErrorMessage(announcements.error ?? me.error);

  useLastSeenMark(announcements.data !== undefined && lastSeenAt !== undefined);

  const reload = (): void => {
    if (announcements.isError) {
      void announcements.refetch();
    }
    if (me.isError) {
      void me.refetch();
    }
  };

  if (announcements.data !== undefined && me.data !== undefined) {
    return (
      <AnnouncementsList
        announcements={announcements.data.announcements}
        lastSeenAt={lastSeenAt}
        mayPost={mayPost}
        highlightedKey={highlightedKey}
      />
    );
  }
  if (errorMessage !== null) {
    return <AnnouncementsError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={ANNOUNCEMENTS_LOADING_LABEL} listShape="cards" />;
};
