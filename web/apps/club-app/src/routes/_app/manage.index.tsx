import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ManagePage } from '@/features/manage-hub';
import { MANAGE_KEYS, RequireAnyPermission } from '@/features/session';

const ManageRoute: FC = () => (
  <RequireAnyPermission permissionKeys={MANAGE_KEYS}>
    <ManagePage />
  </RequireAnyPermission>
);

export const Route = createFileRoute('/_app/manage/')({ component: ManageRoute });
