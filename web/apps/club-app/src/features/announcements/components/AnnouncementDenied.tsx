import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { AccessDenied } from '@/features/session/components/AccessDenied';
import { ANNOUNCEMENTS_ORIGIN } from '../announcements-labels';

const DENIED_MESSAGE = 'Dir fehlt die Berechtigung, Aushänge zu veröffentlichen.';

interface AnnouncementDeniedProps {
  title: string;
}

export const AnnouncementDenied: FC<AnnouncementDeniedProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={ANNOUNCEMENTS_ORIGIN}>
    <AccessDenied message={DENIED_MESSAGE} />
  </KkScreen>
);
