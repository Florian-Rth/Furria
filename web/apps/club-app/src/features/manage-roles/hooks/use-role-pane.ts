import { useState } from 'react';
import { useRoleQuery } from '../api';
import { toRoleDetailsSeed } from '../manage-roles-labels';
import { toRoleErrorMessage } from '../manage-roles-messages';
import type { HolderGroups } from '../roles-hub';
import { DEFAULT_TAB, toHolderGroups, toPastHolders } from '../roles-hub';
import type { RoleDetails, RoleHolder, RolePaneTab, RoleSummary } from '../schemas';
import type { RoleLifecycleControl } from './use-role-lifecycle';
import { useRoleLifecycle } from './use-role-lifecycle';
import type { RolePermissionsControl } from './use-role-permissions';
import { useRolePermissions } from './use-role-permissions';

export interface RolePaneControl {
  details: RoleDetails;
  holdersPending: boolean;
  loadError: string | null;
  isRetrying: boolean;
  groups: HolderGroups;
  past: RoleHolder[];
  permissions: RolePermissionsControl;
  lifecycle: RoleLifecycleControl;
  tab: RolePaneTab;
  chooseTab: (tab: RolePaneTab) => void;
  archiveOpen: boolean;
  restoreOpen: boolean;
  openArchive: () => void;
  openRestore: () => void;
  closeDialogs: () => void;
  reload: () => void;
}

export const useRolePane = (
  role: RoleSummary,
  catalogue: readonly string[],
  requestedTab: RolePaneTab | null,
  today: string,
): RolePaneControl => {
  const [dialog, setDialog] = useState<'archive' | 'restore' | null>(null);
  const [tab, setTab] = useState<RolePaneTab>(requestedTab ?? DEFAULT_TAB);
  const query = useRoleQuery(role.roleId);
  const permissions = useRolePermissions(role, catalogue);
  const closeDialogs = (): void => {
    setDialog(null);
  };
  const lifecycle = useRoleLifecycle({
    role,
    onArchived: closeDialogs,
    onRestored: closeDialogs,
  });
  const details = query.data ?? toRoleDetailsSeed(role);

  return {
    details,
    holdersPending: query.data === undefined || query.isPlaceholderData,
    loadError: query.data === undefined ? toRoleErrorMessage(query.error) : null,
    isRetrying: query.isFetching,
    groups: toHolderGroups(details.holders, today),
    past: toPastHolders(details.pastHolders),
    permissions,
    lifecycle,
    tab,
    chooseTab: setTab,
    archiveOpen: dialog === 'archive',
    restoreOpen: dialog === 'restore',
    openArchive: () => {
      setDialog('archive');
    },
    openRestore: () => {
      setDialog('restore');
    },
    closeDialogs,
    reload: () => {
      void query.refetch();
    },
  };
};
