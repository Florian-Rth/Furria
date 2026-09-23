import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { RoleEditor } from './RoleEditor';
import { RoleEditorDenied } from './RoleEditorDenied';

const TITLE = 'Rolle hinzufügen';

export const RoleNewScreen: FC = () => {
  const { has, isUndecided } = usePermissions();

  if (!isUndecided && !has(PERMISSION_KEYS.rolesManage)) {
    return <RoleEditorDenied title={TITLE} />;
  }

  return <RoleEditor roleEntry={null} />;
};
