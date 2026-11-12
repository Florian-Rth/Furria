import type { FC } from 'react';
import { ANNOUNCEMENT_EDIT_TITLE } from '../announcements-labels';
import { useAnnouncementLookup } from '../hooks/use-announcement-lookup';
import { AnnouncementDenied } from './AnnouncementDenied';
import { AnnouncementEditor } from './AnnouncementEditor';
import { AnnouncementNotFound } from './AnnouncementNotFound';
import { AnnouncementScreenError } from './AnnouncementScreenError';
import { AnnouncementScreenSkeleton } from './AnnouncementScreenSkeleton';

const SCREEN_KIND = 'fullscreen';

interface AnnouncementEditScreenProps {
  announcementId: string;
}

export const AnnouncementEditScreen: FC<AnnouncementEditScreenProps> = ({ announcementId }) => {
  const { lookup, isRetrying, retry } = useAnnouncementLookup(announcementId);

  if (lookup.state === 'loading') {
    return <AnnouncementScreenSkeleton kind={SCREEN_KIND} title={ANNOUNCEMENT_EDIT_TITLE} />;
  }
  if (lookup.state === 'failed') {
    return (
      <AnnouncementScreenError
        kind={SCREEN_KIND}
        message={lookup.message}
        isRetrying={isRetrying}
        onRetry={retry}
      />
    );
  }
  if (lookup.state === 'missing') {
    return <AnnouncementNotFound kind={SCREEN_KIND} />;
  }
  if (!lookup.announcement.viewerMayEdit) {
    return <AnnouncementDenied title={ANNOUNCEMENT_EDIT_TITLE} />;
  }

  return <AnnouncementEditor announcement={lookup.announcement} />;
};
