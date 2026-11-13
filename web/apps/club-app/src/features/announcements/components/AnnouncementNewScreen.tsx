import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ANNOUNCEMENT_CREATE_TITLE } from '../announcements-labels';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { AnnouncementDenied } from './AnnouncementDenied';
import { AnnouncementEditor } from './AnnouncementEditor';
import { AnnouncementScreenError } from './AnnouncementScreenError';
import { AnnouncementScreenSkeleton } from './AnnouncementScreenSkeleton';

const SCREEN_KIND = 'fullscreen';

export const AnnouncementNewScreen: FC = () => {
  const me = useMeQuery();
  const { has, isUndecided } = usePermissions();
  const errorMessage = toAnnouncementsErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (isUndecided) {
    if (errorMessage !== null) {
      return (
        <AnnouncementScreenError
          kind={SCREEN_KIND}
          message={errorMessage}
          isRetrying={me.isFetching}
          onRetry={reload}
        />
      );
    }

    return <AnnouncementScreenSkeleton kind={SCREEN_KIND} title={ANNOUNCEMENT_CREATE_TITLE} />;
  }
  if (!has(PERMISSION_KEYS.announcementsPost)) {
    return <AnnouncementDenied title={ANNOUNCEMENT_CREATE_TITLE} />;
  }

  return <AnnouncementEditor announcement={null} />;
};
