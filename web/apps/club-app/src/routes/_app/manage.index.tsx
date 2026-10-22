import { createFileRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { ManagePage } from '@/features/manage-hub/components/ManagePage';
import { MANAGE_TITLE } from '@/features/manage-hub/manage-hub-labels';
import { MANAGE_KEYS, MORE_SECTION } from '@/features/session/app-sections';
import { RequireAnyScreenPermission } from '@/features/session/components/RequireAnyScreenPermission';

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
