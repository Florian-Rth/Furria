import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GalleryBinPage } from '@/features/gallery/components/GalleryBinPage';
import { GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const GalleryBinPageRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.galleryManage}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <GalleryBinPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/bin')({ component: GalleryBinPageRoute });
