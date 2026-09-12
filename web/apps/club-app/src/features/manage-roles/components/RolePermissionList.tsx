import { KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePermissionsControl } from '../hooks/use-role-permissions';
import { RolePermissionRow } from './RolePermissionRow';
import { RoleSection } from './RoleSection';
import { SelfLockoutDialog } from './SelfLockoutDialog';

const SECTION_TITLE = 'Rechte';
const GUIDANCE =
  'Jede Zeile ist eine Sache, die man tun darf. Umschalten wirkt sofort für alle Inhaber dieser Rolle.';
const ARCHIVED_GUIDANCE =
  'Die Rechte einer archivierten Rolle greifen nicht und lassen sich nicht ändern.';

interface RolePermissionListProps {
  permissions: RolePermissionsControl;
  roleName: string;
  isArchived: boolean;
}

export const RolePermissionList: FC<RolePermissionListProps> = ({
  permissions,
  roleName,
  isArchived,
}) => {
  const rows = permissions.entries.map((entry) => (
    <RolePermissionRow
      key={entry.key}
      entry={entry}
      busy={permissions.isBusy(entry.key)}
      disabled={isArchived}
      onToggle={permissions.toggle}
    />
  ));

  const guidanceTone = isArchived ? 'warning' : 'info';
  const guidance = isArchived ? ARCHIVED_GUIDANCE : GUIDANCE;

  return (
    <RoleSection title={SECTION_TITLE}>
      <KkPanel variant="block">
        <Stack sx={{ gap: 2, minWidth: 0 }}>
          <KkNote icon="info" tone={guidanceTone}>
            {guidance}
          </KkNote>
          <Stack sx={{ gap: 1.75, minWidth: 0 }}>{rows}</Stack>
        </Stack>
      </KkPanel>
      <SelfLockoutDialog
        roleName={roleName}
        entry={permissions.selfLockout}
        onConfirm={permissions.confirmSelfLockout}
        onClose={permissions.cancelSelfLockout}
      />
    </RoleSection>
  );
};
