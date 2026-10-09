import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { AlbumNewScreen, AlbumNewSearchSchema } from '@/features/gallery';
import {
  GALLERY_SORT_KEYS,
  GALLERY_TITLE,
  MORE_SECTION,
  RequireAnyScreenPermission,
} from '@/features/session';

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
