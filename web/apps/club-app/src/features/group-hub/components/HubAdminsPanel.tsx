import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { NO_ADMINS_LINE } from '../group-hub-labels';
import type { HubAdmin } from '../schemas';
import { HubAdminRow } from './HubAdminRow';

const NO_ADMINS_TITLE = 'KEIN GRUPPEN-ADMIN';
const ADD_LABEL = 'Admin';
const ADMIN_NOTE =
  'Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.';

interface HubAdminsPanelProps {
  admins: readonly HubAdmin[];
  canManage: boolean;
  canOpenPerson: boolean;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminsPanel: FC<HubAdminsPanelProps> = ({
  admins,
  canManage,
  canOpenPerson,
  onAdd,
  onEnd,
}) => {
  const rows = admins.map((admin) => (
    <HubAdminRow
      key={admin.groupAdminId}
      admin={admin}
      canManage={canManage}
      canOpenPerson={canOpenPerson}
      onEnd={onEnd}
    />
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
    <KkPanelSection title={GROUP_SECTION_TITLES.admins} action={action} description={ADMIN_NOTE}>
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
