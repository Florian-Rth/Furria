import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import { useRoleQuery } from '../api';
import { toRoleId } from '../manage-roles-labels';
import { toRoleErrorMessage } from '../manage-roles-messages';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorError } from './RoleEditorError';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';
import { RoleHoldingEditor } from './RoleHoldingEditor';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/holdings/new';
const TITLE = 'Inhaberschaft eintragen';

export const RoleHoldingNewScreen: FC = () => {
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
  if (role.data !== undefined && !role.isPlaceholderData) {
    return <RoleHoldingEditor role={role.data} holder={null} prefillPersonId={null} />;
  }
  if (errorMessage !== null) {
    return <RoleEditorError message={errorMessage} onRetry={reload} />;
  }

  return <RoleEditorSkeleton />;
};
