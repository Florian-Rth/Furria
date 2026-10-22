import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { WebsitePicturesPage } from '@/features/website-pictures/components/WebsitePicturesPage';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const WebsitePicturesPageRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.galleryPublish}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <WebsitePicturesPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/website')({
  component: WebsitePicturesPageRoute,
});
