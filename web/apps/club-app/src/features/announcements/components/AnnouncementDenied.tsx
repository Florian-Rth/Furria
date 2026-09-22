import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session';
import { ANNOUNCEMENTS_ORIGIN } from '../announcements-labels';

const DENIED_MESSAGE =
  'Diese Berechtigung fehlt dir — nur wer Aushänge posten darf, hängt einen auf.';

interface AnnouncementDeniedProps {
  title: string;
}

export const AnnouncementDenied: FC<AnnouncementDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={ANNOUNCEMENTS_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
