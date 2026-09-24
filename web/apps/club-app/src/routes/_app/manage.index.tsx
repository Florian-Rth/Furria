import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_TITLE, ManagePage } from '@/features/manage-hub';
import { MANAGE_KEYS, MORE_SECTION, RequireAnyScreenPermission } from '@/features/session';

const ManageRoute: FC = () => (
  <RequireAnyScreenPermission
    permissionKeys={MANAGE_KEYS}
    title={MANAGE_TITLE}
    section={MORE_SECTION}
  >
    <ManagePage />
  </RequireAnyScreenPermission>
);

export const Route = createFileRoute('/_app/manage/')({ component: ManageRoute });
