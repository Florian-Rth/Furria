import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_TITLE, MORE_SECTION, RequireScreenPermission } from '@/features/session';
import { WebsitePicturesPage } from '@/features/website-pictures';
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
