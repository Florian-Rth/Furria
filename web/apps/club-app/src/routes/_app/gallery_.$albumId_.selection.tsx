import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumSelectionScreen } from '@/features/gallery/components/AlbumSelectionScreen';
import { GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const AlbumSelectionScreenRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.galleryPublish}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <AlbumSelectionScreen />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/$albumId_/selection')({
  component: AlbumSelectionScreenRoute,
});
