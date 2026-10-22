import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumEditScreen } from '@/features/gallery/components/AlbumEditScreen';
import { GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AlbumEditScreenRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.galleryManage}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <AlbumEditScreen />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/$albumId_/edit')({
  component: AlbumEditScreenRoute,
});
