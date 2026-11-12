import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  ANNOUNCEMENTS_ORIGIN,
  ANNOUNCEMENTS_TITLE,
} from '@/features/announcements/announcements-labels';
import { AnnouncementEditScreen } from '@/features/announcements/components/AnnouncementEditScreen';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AnnouncementEditRoute: FC = () => {
  const { announcementId } = Route.useParams();

  return (
    <RequireScreenPermission
      permissionKey={PERMISSION_KEYS.clubRead}
      title={ANNOUNCEMENTS_TITLE}
      origin={ANNOUNCEMENTS_ORIGIN}
    >
      <AnnouncementEditScreen announcementId={announcementId} />
    </RequireScreenPermission>
  );
};

export const Route = createFileRoute('/_app/announcements_/$announcementId_/edit')({
  component: AnnouncementEditRoute,
});
