import type { FC } from 'react';
import { useMeQuery, usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { AnnouncementDenied } from './AnnouncementDenied';
import { AnnouncementEditor } from './AnnouncementEditor';
import { AnnouncementEditorError } from './AnnouncementEditorError';
import { AnnouncementEditorSkeleton } from './AnnouncementEditorSkeleton';

const TITLE = 'Aushang hinzufügen';

export const AnnouncementNewScreen: FC = () => {
  const me = useMeQuery();
  const { has, isUndecided } = usePermissions();
  const errorMessage = toAnnouncementsErrorMessage(me.error);

  const reload = (): void => {
    void me.refetch();
  };

  if (isUndecided) {
    if (errorMessage !== null) {
      return <AnnouncementEditorError message={errorMessage} onRetry={reload} />;
    }

    return <AnnouncementEditorSkeleton title={TITLE} />;
  }
  if (!has(PERMISSION_KEYS.announcementsPost)) {
    return <AnnouncementDenied title={TITLE} />;
  }

  return <AnnouncementEditor announcement={null} />;
};
