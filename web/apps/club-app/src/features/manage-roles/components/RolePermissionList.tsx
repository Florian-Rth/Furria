import { KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePermissionsControl } from '../hooks/use-role-permissions';
import { ROLE_SECTION_TITLES } from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';
import { PermissionHandoverDialog } from './PermissionHandoverDialog';
import { RolePermissionRow } from './RolePermissionRow';
import { SelfLockoutDialog } from './SelfLockoutDialog';

const GUIDANCE = 'Änderungen gelten sofort für alle Inhaber dieser Rolle.';
const ARCHIVED_GUIDANCE =
  'Die Rechte einer archivierten Rolle gelten nicht und sind nicht änderbar.';

interface RolePermissionListProps {
  permissions: RolePermissionsControl;
  roleName: string;
  holders: readonly RoleHolder[];
  isArchived: boolean;
}

export const RolePermissionList: FC<RolePermissionListProps> = ({
  permissions,
  roleName,
  holders,
  isArchived,
}) => {
  const rows = permissions.entries.map((entry) => (
    <RolePermissionRow
      key={entry.key}
      entry={entry}
      busy={permissions.isBusy(entry.key)}
      disabled={isArchived}
      error={permissions.errorOf(entry.key)}
      onToggle={permissions.toggle}
    />
  ));

  const archivedNote = isArchived ? (
    <KkNote icon="info" tone="warning">
      {ARCHIVED_GUIDANCE}
    </KkNote>
  ) : null;

  return (
    <KkPanelSection title={ROLE_SECTION_TITLES.permissions} description={GUIDANCE}>
      <KkPanel variant="block">
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          {archivedNote}
          <Stack sx={{ gap: 1.75, minWidth: 0 }}>{rows}</Stack>
        </Stack>
      </KkPanel>
      <SelfLockoutDialog
        roleName={roleName}
        entry={permissions.selfLockout}
        onConfirm={permissions.confirmSelfLockout}
        onClose={permissions.cancelSelfLockout}
      />
      <PermissionHandoverDialog
        roleName={roleName}
        holders={holders}
        entry={permissions.permissionHandover}
        onConfirm={permissions.confirmPermissionHandover}
        onClose={permissions.cancelPermissionHandover}
      />
    </KkPanelSection>
  );
};
