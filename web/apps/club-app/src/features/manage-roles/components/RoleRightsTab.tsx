import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePaneControl } from '../hooks/use-role-pane';
import { isRoleArchived } from '../roles-hub';
import { RIGHTS_GUIDANCE, toRightsMeta } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { PermissionHandoverDialog } from './PermissionHandoverDialog';
import { RoleGrantedList } from './RoleGrantedList';
import { RolePermissionRow } from './RolePermissionRow';
import { SelfLockoutDialog } from './SelfLockoutDialog';

const RIGHTS_TITLE = 'Rechte';

interface RoleRightsTabProps {
  role: RoleSummary;
  catalogue: readonly string[];
  control: RolePaneControl;
}

export const RoleRightsTab: FC<RoleRightsTabProps> = ({ role, catalogue, control }) => {
  const { permissions } = control;
  const meta = toRightsMeta(role.permissionKeys.length, catalogue.length);

  if (isRoleArchived(role)) {
    return (
      <KkPanelSection title={RIGHTS_TITLE} meta={meta}>
        <RoleGrantedList entries={permissions.entries} />
      </KkPanelSection>
    );
  }

  const rows = permissions.entries.map((entry) => (
    <RolePermissionRow
      key={entry.key}
      entry={entry}
      busy={permissions.isBusy(entry.key)}
      error={permissions.errorOf(entry.key)}
      onToggle={permissions.toggle}
    />
  ));

  return (
    <KkPanelSection title={RIGHTS_TITLE} meta={meta} description={RIGHTS_GUIDANCE}>
      <Stack sx={{ gap: 0, minWidth: 0 }}>{rows}</Stack>
      <SelfLockoutDialog
        roleName={role.name}
        entry={permissions.selfLockout}
        onConfirm={permissions.confirmSelfLockout}
        onClose={permissions.cancelSelfLockout}
      />
      <PermissionHandoverDialog
        roleName={role.name}
        holders={control.details.holders}
        entry={permissions.permissionHandover}
        onConfirm={permissions.confirmPermissionHandover}
        onClose={permissions.cancelPermissionHandover}
      />
    </KkPanelSection>
  );
};
