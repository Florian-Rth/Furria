import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumNewScreen } from '@/features/gallery/components/AlbumNewScreen';
import { AlbumNewSearchSchema } from '@/features/gallery/gallery-copy';
import { GALLERY_SORT_KEYS, GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

const AlbumNewScreenRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={GALLERY_SORT_KEYS}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <AlbumNewScreen />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/new')({
  validateSearch: AlbumNewSearchSchema,
  component: AlbumNewScreenRoute,
});
