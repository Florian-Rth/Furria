import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ANNOUNCEMENTS_ORIGIN,
  ANNOUNCEMENTS_TITLE,
} from '@/features/announcements/announcements-labels';
import { AnnouncementScreen } from '@/features/announcements/components/AnnouncementScreen';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementRoute: FC = () => {
  const { announcementId } = Route.useParams();

  return (
    <RequireScreenPermission
      permissionKey={PERMISSION_KEYS.clubRead}
      title={ANNOUNCEMENTS_TITLE}
      origin={ANNOUNCEMENTS_ORIGIN}
    >
      <AnnouncementScreen announcementId={announcementId} />
    </RequireScreenPermission>
  );
};

export const Route = createFileRoute('/_app/announcements_/$announcementId')({
  component: AnnouncementRoute,
});
