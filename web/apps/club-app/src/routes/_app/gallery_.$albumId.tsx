import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumPage, AlbumSearchSchema } from '@/features/gallery';
import {
  GALLERY_KEYS,
  GALLERY_TITLE,
  MORE_SECTION,
  RequireAnyScreenPermission,
} from '@/features/session';

const AlbumPageRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={GALLERY_KEYS}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <AlbumPage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/$albumId')({
  validateSearch: AlbumSearchSchema,
  component: AlbumPageRoute,
});
