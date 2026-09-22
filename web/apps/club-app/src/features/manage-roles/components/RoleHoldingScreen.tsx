import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRoleQuery } from '../api';
import { toRoleHoldingId, toRoleId } from '../manage-roles-labels';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';
import { RoleHoldingEditor } from './RoleHoldingEditor';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/holdings/$roleHoldingId';
const TITLE = 'Inhaberschaft beenden';

export const RoleHoldingScreen: FC = () => {
  const { roleId, roleHoldingId } = useParams({ from: ROUTE_ID });
  const { has } = usePermissions();
  const id = toRoleId(roleId);
  const holdingId = toRoleHoldingId(roleHoldingId);
  const role = useRoleQuery(id);

  if (!has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }
  if (id === null || holdingId === null) {
    return <RoleEditorNotFound />;
  }
  if (role.data === undefined) {
    return role.isLoading ? <RoleEditorSkeleton /> : <RoleEditorNotFound />;
  }

  const holder = role.data.holders.find((entry) => entry.roleHoldingId === holdingId) ?? null;

  if (holder === null) {
    return <RoleEditorNotFound />;
  }

  return <RoleHoldingEditor role={role.data} holder={holder} prefillPersonId={null} />;
};
