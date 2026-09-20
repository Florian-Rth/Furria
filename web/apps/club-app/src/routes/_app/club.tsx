import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ClubPage } from '@/features/club';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const ClubRoute: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.clubRead}>
    <ClubPage />
  </RequirePermission>
);

export const Route = createFileRoute('/_app/club')({ component: ClubRoute });
