import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumPage } from '@/features/gallery/components/AlbumPage';
import { AlbumSearchSchema } from '@/features/gallery/gallery-copy';
import { GALLERY_KEYS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

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
