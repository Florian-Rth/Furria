import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryInboxPage } from '@/features/gallery/components/GalleryInboxPage';
import { InboxSearchSchema } from '@/features/gallery/gallery-copy';
import { GALLERY_SORT_KEYS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

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
