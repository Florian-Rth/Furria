import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRolesQuery } from '../api';
import { toRolesLead } from '../manage-roles-labels';
import { RolesBody } from './RolesBody';

const ROLES_TITLE = 'Rollen & Rechte';

export const RolesPage: FC = () => {
  const roles = useRolesQuery();
  const lead = roles.data === undefined ? undefined : toRolesLead(roles.data.roles);

  return (
    <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
      <AppPageHeader>
        <KkAppShell.PageTitle>{ROLES_TITLE}</KkAppShell.PageTitle>
        <KkAppShell.PageLead>{lead}</KkAppShell.PageLead>
      </AppPageHeader>
      <RolesBody />
    </RequirePermission>
  );
};
