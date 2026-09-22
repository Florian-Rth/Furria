import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AnnouncementNewScreen } from '@/features/announcements';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementNewRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <AnnouncementNewScreen />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/announcements_/new')({
  component: AnnouncementNewRoute,
});
