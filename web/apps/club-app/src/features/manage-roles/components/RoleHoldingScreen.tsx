import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { isNotFoundError } from '@/lib/query-error';
import { useLastSeen } from '@/lib/use-last-seen';
import { useRoleQuery } from '../api';
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
  const id = parsePositiveId(roleId);
  const holdingId = parsePositiveId(roleHoldingId);
  const role = useRoleQuery(has(PERMISSION_KEYS.rolesManage) ? id : null);
  const errorMessage = toRoleErrorMessage(role.error);
  const loadedRole = role.isPlaceholderData ? undefined : role.data;
  const held = useLastSeen(
    loadedRole,
    (role) => role.holders.find((entry) => entry.roleHoldingId === holdingId) ?? null,
  );
  const isMissing =
    id === null || holdingId === null || isNotFoundError(role.error) || loadedRole !== undefined;

  const reload = (): void => {
    void role.refetch();
  };

  if (held !== null) {
    return <RoleHoldingEditor role={held.source} holder={held.entry} prefillPersonId={null} />;
  }
  if (!isUndecided && !has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }
  if (isMissing) {
    return <RoleEditorNotFound />;
  }
  if (errorMessage !== null) {
    return <RoleEditorError message={errorMessage} onRetry={reload} />;
  }

  return <RoleEditorSkeleton />;
};
