import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { ANNOUNCEMENTS_ORIGIN, ANNOUNCEMENTS_TITLE } from '../announcements-labels';
import { AnnouncementsError } from './AnnouncementsError';

interface AnnouncementEditorErrorProps {
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const AnnouncementEditorError: FC<AnnouncementEditorErrorProps> = ({
  message,
  isRetrying,
  onRetry,
}) => (
  <KkScreen kind="fullscreen" title={ANNOUNCEMENTS_TITLE} origin={ANNOUNCEMENTS_ORIGIN}>
    <AnnouncementsError message={message} isRetrying={isRetrying} onRetry={onRetry} />
  </KkScreen>
);
