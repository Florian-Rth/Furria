import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { isNotFoundError } from '@/lib/query-error';
import { useRoleQuery } from '../api';
import { toRoleErrorMessage } from '../manage-roles-messages';
import { RoleEditor } from './RoleEditor';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorError } from './RoleEditorError';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/edit';
const TITLE = 'Rolle bearbeiten';

export const RoleEditScreen: FC = () => {
  const { roleId } = useParams({ from: ROUTE_ID });
  const { from } = useSearch({ from: ROUTE_ID });
  const returnTo = from === 'role' ? 'role' : 'hub';
  const { has, isUndecided } = usePermissions();
  const id = parsePositiveId(roleId);
  const role = useRoleQuery(has(PERMISSION_KEYS.rolesManage) ? id : null);
  const errorMessage = toRoleErrorMessage(role.error);

  const reload = (): void => {
    void role.refetch();
  };

  if (!isUndecided && !has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }
  if (id === null || isNotFoundError(role.error)) {
    return <RoleEditorNotFound />;
  }
  if (role.data !== undefined && !role.isPlaceholderData) {
    return <RoleEditor roleEntry={role.data} returnTo={returnTo} />;
  }
  if (errorMessage !== null) {
    return <RoleEditorError message={errorMessage} onRetry={reload} />;
  }

  return <RoleEditorSkeleton />;
};
