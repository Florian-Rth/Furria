import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ANNOUNCEMENTS_TITLE, AnnouncementsPage } from '@/features/announcements';
import { CLUB_ORIGIN, RequireScreenPermission } from '@/features/session';
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
