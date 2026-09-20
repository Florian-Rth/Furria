import { KkButton, KkErrorState } from '@furria/ui';
import type { FC } from 'react';
import { ANNOUNCEMENTS_ERROR_TITLE, ANNOUNCEMENTS_RETRY_LABEL } from '../announcements-labels';

interface AnnouncementsErrorProps {
  message: string;
  onRetry: () => void;
}

export const AnnouncementsError: FC<AnnouncementsErrorProps> = ({ message, onRetry }) => (
  <KkErrorState
    title={ANNOUNCEMENTS_ERROR_TITLE}
    description={message}
    action={<KkButton onClick={onRetry}>{ANNOUNCEMENTS_RETRY_LABEL}</KkButton>}
  />
);
