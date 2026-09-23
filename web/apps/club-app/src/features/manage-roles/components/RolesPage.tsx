import { KkScreen, KkSkeletonToolbar, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import {
  MANAGE_ORIGIN,
  RequirePermission,
  usePermissions,
  useScreenSearch,
} from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRolesQuery } from '../api';
import { useRoleSearch } from '../hooks/use-role-search';
import { ROLES_LEAD } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';
import { RolesBody } from './RolesBody';
import { RolesToolbar } from './RolesToolbar';

const ROLES_TITLE = 'Rollen & Rechte';

const SEARCH_PLACEHOLDER = 'Name oder Aufgabe';

const TOOLBAR_CHIPS = 3;

const NO_ROLES: readonly RoleSummary[] = [];

export const RolesPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const roles = useRolesQuery();
  const rows = roles.data?.roles ?? NO_ROLES;
  const search = useRoleSearch(rows);
  const { has, isUndecided } = usePermissions();
  const canManage = isUndecided || has(PERMISSION_KEYS.rolesManage);

  const toolRow =
    roles.data === undefined ? (
      <KkSkeletonToolbar chips={TOOLBAR_CHIPS} />
    ) : (
      <RolesToolbar
        status={search.status}
        options={search.filterOptions}
        onStatusChange={search.selectStatus}
      />
    );

  return (
    <KkScreen
      kind="list"
      search={searchMode}
      tools={canManage ? toolRow : undefined}
      title={ROLES_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={ROLES_TITLE} lead={ROLES_LEAD} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
        <RolesBody search={search} />
      </RequirePermission>
    </KkScreen>
  );
};
