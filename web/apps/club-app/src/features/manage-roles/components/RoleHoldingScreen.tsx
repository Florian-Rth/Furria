import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { isNotFoundError } from '@/lib/query-error';
import { useRoleQuery } from '../api';
import { toRoleHoldingId, toRoleId } from '../manage-roles-labels';
import { toRoleErrorMessage } from '../manage-roles-messages';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorError } from './RoleEditorError';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';
import { RoleHoldingEditor } from './RoleHoldingEditor';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/holdings/$roleHoldingId';
const TITLE = 'Inhaberschaft beenden';

export const RoleHoldingScreen: FC = () => {
  const { roleId, roleHoldingId } = useParams({ from: ROUTE_ID });
  const { has, isUndecided } = usePermissions();
  const id = toRoleId(roleId);
  const holdingId = toRoleHoldingId(roleHoldingId);
  const role = useRoleQuery(id);
  const errorMessage = toRoleErrorMessage(role.error);

  const reload = (): void => {
    void role.refetch();
  };

  if (!isUndecided && !has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }
  if (id === null || holdingId === null || isNotFoundError(role.error)) {
    return <RoleEditorNotFound />;
  }
  if (role.data !== undefined && !role.isPlaceholderData) {
    const holder = role.data.holders.find((entry) => entry.roleHoldingId === holdingId) ?? null;

    if (holder === null) {
      return <RoleEditorNotFound />;
    }

    return <RoleHoldingEditor role={role.data} holder={holder} prefillPersonId={null} />;
  }
  if (errorMessage !== null) {
    return <RoleEditorError message={errorMessage} onRetry={reload} />;
  }

  return <RoleEditorSkeleton />;
};
