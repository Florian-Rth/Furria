import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AnnouncementsPage } from '@/features/announcements';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementsRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <AnnouncementsPage />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/announcements')({ component: AnnouncementsRoute });
