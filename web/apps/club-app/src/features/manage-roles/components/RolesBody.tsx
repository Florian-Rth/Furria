import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useRolesQuery } from '../api';
import type { RoleSearchControl } from '../hooks/use-role-search';
import { useSelectedRole } from '../hooks/use-selected-role';
import { toRolesErrorMessage } from '../manage-roles-messages';
import { RolesError } from './RolesError';
import { RolesView } from './RolesView';

const LOADING_LABEL = 'Rollen werden geladen';

interface RolesBodyProps {
  search: RoleSearchControl;
}

export const RolesBody: FC<RolesBodyProps> = ({ search }) => {
  const roles = useRolesQuery();
  const { roleId } = useSelectedRole();
  const errorMessage = toRolesErrorMessage(roles.error);

  const reload = (): void => {
    void roles.refetch();
  };

  if (roles.data !== undefined) {
    return (
      <RolesView roles={roles.data.roles} catalogue={roles.data.permissionKeys} search={search} />
    );
  }
  if (errorMessage !== null) {
    return <RolesError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="cards" hasSelection={roleId !== null} />;
};
