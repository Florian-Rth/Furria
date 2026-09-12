import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { RolesBody } from './RolesBody';

const ROLES_TITLE = 'Rollen & Rechte';

export const RolesPage: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
    <AppPageHeader>
      <KkAppShell.PageTitle>{ROLES_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <RolesBody />
  </RequirePermission>
);
