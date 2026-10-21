import type { KkScreenActions } from '@furria/ui';
import { KkScreen, KkTitleHeader } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, MANAGE_ORIGIN, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { ROLES_LEAD } from '../manage-roles-labels';
import { NEW_ROLE_LABEL, NEW_ROLE_PATH, ROLES_TITLE } from '../roles-hub-copy';
import { RolesBody } from './RolesBody';

const header = <KkTitleHeader title={ROLES_TITLE} lead={ROLES_LEAD} />;

export const RolesPage: FC = () => {
  const navigate = useNavigate();
  const actions: KkScreenActions = [
    {
      id: 'new-role',
      label: NEW_ROLE_LABEL,
      icon: 'add',
      onSelect: () => {
        void navigate({ to: NEW_ROLE_PATH });
      },
    },
  ];

  return (
    <KkScreen
      kind="list"
      title={ROLES_TITLE}
      origin={MANAGE_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
      actions={actions}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.rolesManage}>
        <RolesBody />
      </RequirePermission>
    </KkScreen>
  );
};
