import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { toAnnouncementIdParam } from '../announcements-labels';
import { toAnnouncementsErrorMessage } from '../announcements-messages';
import { useAnnouncementsQuery } from '../api';
import { AnnouncementDenied } from './AnnouncementDenied';
import { AnnouncementEditor } from './AnnouncementEditor';
import { AnnouncementEditorError } from './AnnouncementEditorError';
import { AnnouncementEditorSkeleton } from './AnnouncementEditorSkeleton';
import { AnnouncementNotFound } from './AnnouncementNotFound';

const ROUTE_ID = '/_app/announcements_/$announcementId';
const TITLE = 'Aushang ändern';

export const AnnouncementScreen: FC = () => {
  const { announcementId } = useParams({ from: ROUTE_ID });
  const id = toAnnouncementIdParam(announcementId);
  const announcements = useAnnouncementsQuery();
  const errorMessage = toAnnouncementsErrorMessage(announcements.error);

  const reload = (): void => {
    void announcements.refetch();
  };

  if (announcements.data === undefined) {
    if (errorMessage !== null) {
      return <AnnouncementEditorError message={errorMessage} onRetry={reload} />;
    }

    return <AnnouncementEditorSkeleton title={TITLE} />;
  }

  const announcement =
    id === null
      ? null
      : (announcements.data.announcements.find((entry) => entry.announcementId === id) ?? null);

  if (announcement === null) {
    return <AnnouncementNotFound />;
  }
  if (!announcement.viewerMayEdit) {
    return <AnnouncementDenied title={TITLE} />;
  }

  return <AnnouncementEditor announcement={announcement} />;
};
