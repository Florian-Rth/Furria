import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryInboxPage, InboxSearchSchema } from '@/features/gallery';
import {
  GALLERY_SORT_KEYS,
  GALLERY_TITLE,
  MORE_SECTION,
  RequireAnyScreenPermission,
} from '@/features/session';

const GalleryInboxPageRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={GALLERY_SORT_KEYS}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <GalleryInboxPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/inbox')({
  validateSearch: InboxSearchSchema,
  component: GalleryInboxPageRoute,
});
