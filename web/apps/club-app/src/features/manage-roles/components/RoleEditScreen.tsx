import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import { useRoleQuery } from '../api';
import { toRoleId } from '../manage-roles-labels';
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
  const { has, isUndecided } = usePermissions();
  const id = toRoleId(roleId);
  const role = useRoleQuery(id);
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
  if (role.data !== undefined) {
    return <RoleEditor roleEntry={role.data} />;
  }
  if (errorMessage !== null) {
    return <RoleEditorError message={errorMessage} onRetry={reload} />;
  }

  return <RoleEditorSkeleton />;
};
