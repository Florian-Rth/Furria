import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ANNOUNCEMENTS_TITLE } from '@/features/announcements/announcements-labels';
import { AnnouncementsPage } from '@/features/announcements/components/AnnouncementsPage';
import { CLUB_ORIGIN } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementsRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={ANNOUNCEMENTS_TITLE}
    origin={CLUB_ORIGIN}
  >
    <AnnouncementsPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/announcements')({ component: AnnouncementsRoute });
