import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { GALLERY_TITLE, MORE_SECTION } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
import { UploadLinksPage } from '@/features/upload-links/components/UploadLinksPage';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const UploadLinksPageRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.galleryManage}
    title={GALLERY_TITLE}
    section={MORE_SECTION}
  >
    <UploadLinksPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/gallery_/links')({ component: UploadLinksPageRoute });
