import type { FC } from 'react';
import { useRolesQuery } from '../api';
import { toRolesErrorMessage } from '../manage-roles-messages';
import { RolesError } from './RolesError';
import { RolesSkeleton } from './RolesSkeleton';
import { RolesView } from './RolesView';

export const RolesBody: FC = () => {
  const roles = useRolesQuery();
  const errorMessage = toRolesErrorMessage(roles.error);

  const reload = (): void => {
    void roles.refetch();
  };

  if (roles.data !== undefined) {
    return <RolesView roles={roles.data.roles} catalogue={roles.data.permissionKeys} />;
  }
  if (errorMessage !== null) {
    return <RolesError message={errorMessage} onRetry={reload} />;
  }

  return <RolesSkeleton />;
};
