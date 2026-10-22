import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryHubPage } from '@/features/gallery/components/GalleryHubPage';
import { GALLERY_KEYS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

const GalleryHubPageRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={GALLERY_KEYS}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <GalleryHubPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/gallery')({
  component: GalleryHubPageRoute,
});
