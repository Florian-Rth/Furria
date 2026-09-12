import { KkButton, KkEmptyState, KkIcon, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { HUB_SECTION_TITLES, NO_ADMINS_LINE } from '../group-hub-labels';
import type { HubAdmin } from '../schemas';
import { HubAdminRow } from './HubAdminRow';
import { HubSection } from './HubSection';

const NO_ADMINS_TITLE = 'KEIN GRUPPEN-ADMIN';
const ADD_LABEL = 'Admin';
const ADMIN_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

interface HubAdminsPanelProps {
  admins: readonly HubAdmin[];
  canManage: boolean;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminsPanel: FC<HubAdminsPanelProps> = ({ admins, canManage, onAdd, onEnd }) => {
  const rows = admins.map((admin) => (
    <HubAdminRow key={admin.groupAdminId} admin={admin} canManage={canManage} onEnd={onEnd} />
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
    <KkEmptyState title={NO_ADMINS_TITLE} description={NO_ADMINS_LINE} />
  ) : (
    rows
  );

  return (
    <HubSection title={HUB_SECTION_TITLES.admins} action={action}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <KkPanel variant={variant}>{body}</KkPanel>
        <KkNote>{ADMIN_NOTE}</KkNote>
      </Stack>
    </HubSection>
  );
};
