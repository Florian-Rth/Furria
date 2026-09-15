import { KkScreen, KkTitleHeader } from '@furria/ui';
import type { FC } from 'react';
import { MORE_ORIGIN, RequirePermission, useScreenSearch } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRolesQuery } from '../api';
import { toRolesLead } from '../manage-roles-labels';
import { RolesBody } from './RolesBody';

const ROLES_TITLE = 'Rollen & Rechte';

const SEARCH_PLACEHOLDER = 'Name oder Aufgabe';

export const RolesPage: FC = () => {
  const search = useScreenSearch(SEARCH_PLACEHOLDER);
  const roles = useRolesQuery();
  const lead = roles.data === undefined ? undefined : toRolesLead(roles.data.roles);

  return (
    <KkScreen
      kind="list"
      search={search}
      title={ROLES_TITLE}
      origin={MORE_ORIGIN}
      header={<KkTitleHeader title={ROLES_TITLE} lead={lead} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
        <RolesBody />
      </RequirePermission>
    </KkScreen>
  );
};
