import { KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePermissionsControl } from '../hooks/use-role-permissions';
import type { RoleHolder } from '../schemas';
import { KeyHandoverDialog } from './KeyHandoverDialog';
import { RolePermissionRow } from './RolePermissionRow';
import { SelfLockoutDialog } from './SelfLockoutDialog';

const SECTION_TITLE = 'Rechte';
const GUIDANCE =
  'Jede Zeile ist eine Sache, die man tun darf. Umschalten wirkt sofort für alle Inhaber dieser Rolle.';
const ARCHIVED_GUIDANCE =
  'Die Rechte einer archivierten Rolle greifen nicht und lassen sich nicht ändern.';

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
      onToggle={permissions.toggle}
    />
  ));

  const archivedNote = isArchived ? (
    <KkNote icon="info" tone="warning">
      {ARCHIVED_GUIDANCE}
    </KkNote>
  ) : null;

  return (
    <KkPanelSection title={SECTION_TITLE} description={GUIDANCE}>
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
      <KeyHandoverDialog
        roleName={roleName}
        holders={holders}
        entry={permissions.keyHandover}
        onConfirm={permissions.confirmKeyHandover}
        onClose={permissions.cancelKeyHandover}
      />
    </KkPanelSection>
  );
};
