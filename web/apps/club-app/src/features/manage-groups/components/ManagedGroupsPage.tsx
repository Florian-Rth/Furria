import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ManagedGroupsBody } from './ManagedGroupsBody';

const MANAGE_GROUPS_TITLE = 'Gruppenverwaltung';

export const ManagedGroupsPage: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
    <AppPageHeader>
      <KkAppShell.PageTitle>{MANAGE_GROUPS_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <ManagedGroupsBody />
  </RequirePermission>
);
