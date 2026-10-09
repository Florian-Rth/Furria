import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryUploadPage, UploadSearchSchema } from '@/features/gallery';
import {
  GALLERY_SORT_KEYS,
  GALLERY_TITLE,
  MORE_SECTION,
  RequireAnyScreenPermission,
} from '@/features/session';

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
