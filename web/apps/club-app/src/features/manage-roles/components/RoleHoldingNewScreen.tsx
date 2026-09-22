import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRoleQuery } from '../api';
import { toRoleId } from '../manage-roles-labels';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';
import { RoleHoldingEditor } from './RoleHoldingEditor';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/holdings/new';
const TITLE = 'Inhaberschaft eintragen';

export const RoleHoldingNewScreen: FC = () => {
  const { roleId } = useParams({ from: ROUTE_ID });
  const { has } = usePermissions();
  const id = toRoleId(roleId);
  const role = useRoleQuery(id);

  if (!has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }
  if (id === null) {
    return <RoleEditorNotFound />;
  }
  if (role.data === undefined) {
    return role.isLoading ? <RoleEditorSkeleton /> : <RoleEditorNotFound />;
  }

  return <RoleHoldingEditor role={role.data} holder={null} prefillPersonId={null} />;
};
