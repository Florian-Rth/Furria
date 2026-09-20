import type { KkScreenAction } from '@furria/ui';
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
import { useRoleCreateDialog } from '../hooks/use-role-create-dialog';
import { useRoleSearch } from '../hooks/use-role-search';
import { useSelectedRole } from '../hooks/use-selected-role';
import { toRolesLead } from '../manage-roles-labels';
import type { RoleSummary } from '../schemas';
import { RoleFormDialog } from './RoleFormDialog';
import { RolesBody } from './RolesBody';
import { RolesToolbar } from './RolesToolbar';

const ROLES_TITLE = 'Rollen & Rechte';

const SEARCH_PLACEHOLDER = 'Name oder Aufgabe';

const CREATE_LABEL = 'Rolle anlegen';

const TOOLBAR_CHIPS = 3;

const NO_ROLES: readonly RoleSummary[] = [];

export const RolesPage: FC = () => {
  const searchMode = useScreenSearch(SEARCH_PLACEHOLDER);
  const roles = useRolesQuery();
  const rows = roles.data?.roles ?? NO_ROLES;
  const search = useRoleSearch(rows);
  const create = useRoleCreateDialog();
  const { select } = useSelectedRole();
  const { has } = usePermissions();
  const canManage = has(PERMISSION_KEYS.rolesManage);
  const lead = roles.data === undefined ? undefined : toRolesLead(rows);

  const onCreated = (createdRoleId: number | null): void => {
    create.close();

    if (createdRoleId !== null) {
      select(createdRoleId);
    }
  };

  const createAction: KkScreenAction = {
    id: 'create-role',
    label: CREATE_LABEL,
    icon: 'add',
    emphasis: true,
    onSelect: create.open,
  };

  const actions: readonly [KkScreenAction] | undefined = canManage ? [createAction] : undefined;

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
      actions={actions}
      tools={canManage ? toolRow : undefined}
      title={ROLES_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={ROLES_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
        <RolesBody search={search} onCreate={create.open} />
        <RoleFormDialog
          open={create.isOpen}
          editedRole={null}
          onClose={create.close}
          onSaved={onCreated}
        />
      </RequirePermission>
    </KkScreen>
  );
};
