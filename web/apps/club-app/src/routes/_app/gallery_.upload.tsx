import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryUploadPage } from '@/features/gallery/components/GalleryUploadPage';
import { UploadSearchSchema } from '@/features/gallery/gallery-copy';
import { GALLERY_SORT_KEYS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

const GalleryUploadPageRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={GALLERY_SORT_KEYS}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <GalleryUploadPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/upload')({
  validateSearch: UploadSearchSchema,
  component: GalleryUploadPageRoute,
});
