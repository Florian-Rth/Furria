import { KkButton, KkEmptyState, KkIcon, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import type { ManagedAdmin } from '../schemas';
import { OverrideAdminRow } from './OverrideAdminRow';

const ADD_LABEL = 'Admin';
const EMPTY_TITLE = 'KEIN GRUPPEN-ADMIN';
const EMPTY_DESCRIPTION =
  'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen. Ohne Admin pflegt die Gruppenverwaltung sie allein.';
const ADMIN_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

interface OverrideAdminsPanelProps {
  admins: readonly ManagedAdmin[];
  canManage: boolean;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const OverrideAdminsPanel: FC<OverrideAdminsPanelProps> = ({
  admins,
  canManage,
  onAdd,
  onEnd,
}) => {
  const rows = admins.map((admin) => (
    <OverrideAdminRow key={admin.groupAdminId} admin={admin} canManage={canManage} onEnd={onEnd} />
  ));

  const isEmpty = rows.length === 0;
  const variant = isEmpty ? 'block' : 'list';

  const action = canManage ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={onAdd}
    >
      {ADD_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection title={MANAGE_GROUPS_SECTION_TITLES.admins} action={action}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanel variant={variant}>{body}</KkPanel>
        <KkNote>{ADMIN_NOTE}</KkNote>
      </Stack>
    </KkPanelSection>
  );
};
