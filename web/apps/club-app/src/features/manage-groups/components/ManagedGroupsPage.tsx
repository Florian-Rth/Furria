import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useManagedGroupsQuery } from '../api';
import { toManagedGroupsIntro } from '../manage-groups-labels';
import { ManagedGroupsBody } from './ManagedGroupsBody';

const MANAGE_GROUPS_TITLE = 'Gruppenverwaltung';

export const ManagedGroupsPage: FC = () => {
  const groups = useManagedGroupsQuery();
  const lead = groups.data === undefined ? undefined : toManagedGroupsIntro(groups.data.groups);

  return (
    <RequirePermission permissionKey={PERMISSION_KEYS.groupsManage}>
      <AppPageHeader>
        <KkAppShell.PageTitle>{MANAGE_GROUPS_TITLE}</KkAppShell.PageTitle>
        <KkAppShell.PageLead>{lead}</KkAppShell.PageLead>
      </AppPageHeader>
      <ManagedGroupsBody />
    </RequirePermission>
  );
};
