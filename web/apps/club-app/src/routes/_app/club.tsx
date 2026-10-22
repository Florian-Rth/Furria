import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubPage } from '@/features/club/components/ClubPage';
import { CLUB_SECTION, CLUB_TITLE } from '@/features/session/app-sections';
import { RequireScreenPermission } from '@/features/session/components/RequireScreenPermission';
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
