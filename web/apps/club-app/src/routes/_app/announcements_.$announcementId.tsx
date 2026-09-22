import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AnnouncementScreen } from '@/features/announcements';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <AnnouncementScreen />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/announcements_/$announcementId')({
  component: AnnouncementRoute,
});
