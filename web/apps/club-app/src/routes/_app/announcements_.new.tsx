import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ANNOUNCEMENTS_ORIGIN,
  ANNOUNCEMENTS_TITLE,
} from '@/features/announcements/announcements-labels';
import { AnnouncementNewScreen } from '@/features/announcements/components/AnnouncementNewScreen';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementNewRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={ANNOUNCEMENTS_TITLE}
    origin={ANNOUNCEMENTS_ORIGIN}
  >
    <AnnouncementNewScreen />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/announcements_/new')({
  component: AnnouncementNewRoute,
});
