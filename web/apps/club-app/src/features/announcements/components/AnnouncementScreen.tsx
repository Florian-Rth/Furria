import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { ANNOUNCEMENTS_ORIGIN, ANNOUNCEMENTS_TITLE } from '../announcements-labels';
import { useAnnouncementReading } from '../hooks/use-announcement-reading';
import { AnnouncementNotFound } from './AnnouncementNotFound';
import { AnnouncementReadingBody } from './AnnouncementReadingBody';
import { AnnouncementScreenError } from './AnnouncementScreenError';
import { AnnouncementScreenSkeleton } from './AnnouncementScreenSkeleton';

const SCREEN_KIND = 'detail';

interface AnnouncementScreenProps {
  announcementId: string;
}

export const AnnouncementScreen: FC<AnnouncementScreenProps> = ({ announcementId }) => {
  const { lookup, isRetrying, retry, isExpired, actions } = useAnnouncementReading(announcementId);

  if (lookup.state === 'loading') {
    return <AnnouncementScreenSkeleton kind={SCREEN_KIND} title={ANNOUNCEMENTS_TITLE} />;
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

  return (
    <KkScreen
      kind={SCREEN_KIND}
      title={lookup.announcement.title}
      origin={ANNOUNCEMENTS_ORIGIN}
      actions={actions}
    >
      <AnnouncementReadingBody announcement={lookup.announcement} isExpired={isExpired} />
    </KkScreen>
  );
};
