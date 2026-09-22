import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useRoleQuery } from '../api';
import { toRoleId } from '../manage-roles-labels';
import { RoleEditor } from './RoleEditor';
import { RoleEditorDenied } from './RoleEditorDenied';
import { RoleEditorNotFound } from './RoleEditorNotFound';
import { RoleEditorSkeleton } from './RoleEditorSkeleton';

const ROUTE_ID = '/_app/manage/roles_/$roleId_/edit';
const TITLE = 'Rolle bearbeiten';

export const RoleEditScreen: FC = () => {
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

  return <RoleEditor roleEntry={role.data} />;
};
