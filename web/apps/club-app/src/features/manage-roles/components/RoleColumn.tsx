import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useRoleQuery } from '../api';
import { toRoleErrorMessage } from '../manage-roles-messages';
import { RoleDetail } from './RoleDetail';
import { RoleDetailSkeleton } from './RoleDetailSkeleton';
import { RoleNotFound } from './RoleNotFound';
import { RolesError } from './RolesError';
import { RoleUnselected } from './RoleUnselected';

interface RoleColumnProps {
  roleId: number | null;
  catalogue: readonly string[];
}

export const RoleColumn: FC<RoleColumnProps> = ({ roleId, catalogue }) => {
  const role = useRoleQuery(roleId);
  const errorMessage = toRoleErrorMessage(role.error);

  const reload = (): void => {
    void role.refetch();
  };

  if (roleId === null) {
    return <RoleUnselected />;
  }
  if (role.data !== undefined) {
    return (
      <RoleDetail role={role.data} catalogue={catalogue} holdersPending={role.isPlaceholderData} />
    );
  }
  if (isNotFoundError(role.error)) {
    return <RoleNotFound />;
  }
  if (errorMessage !== null) {
    return <RolesError message={errorMessage} onRetry={reload} />;
  }

  return <RoleDetailSkeleton />;
};
