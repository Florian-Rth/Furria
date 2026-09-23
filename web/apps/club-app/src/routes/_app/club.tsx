import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubPage } from '@/features/club';
import { CLUB_SECTION, CLUB_TITLE, RequireScreenPermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const ClubRoute: FC = () => (
  <RequireScreenPermission
    permissionKey={PERMISSION_KEYS.clubRead}
    title={CLUB_TITLE}
    section={CLUB_SECTION}
  >
    <ClubPage />
  </RequireScreenPermission>
);

export const Route = createFileRoute('/_app/club')({ component: ClubRoute });
