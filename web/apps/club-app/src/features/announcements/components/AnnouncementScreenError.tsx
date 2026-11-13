import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import {
  type AnnouncementScreenKind,
  toAnnouncementScreenFrame,
} from '../announcement-screen-kind';
import { ANNOUNCEMENTS_TITLE } from '../announcements-labels';
import { AnnouncementsError } from './AnnouncementsError';

interface AnnouncementScreenErrorProps {
  kind: AnnouncementScreenKind;
  message: string;
  isRetrying: boolean;
  onRetry: () => void;
}

export const AnnouncementScreenError: FC<AnnouncementScreenErrorProps> = ({
  kind,
  message,
  isRetrying,
  onRetry,
}) => {
  const frame = toAnnouncementScreenFrame(kind, ANNOUNCEMENTS_TITLE);

  return (
    <KkScreen {...frame}>
      <AnnouncementsError message={message} isRetrying={isRetrying} onRetry={onRetry} />
    </KkScreen>
  );
};
