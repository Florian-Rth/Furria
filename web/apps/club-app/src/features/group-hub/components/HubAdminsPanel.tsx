import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_ADMINS_NOTE, GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { ADD_ADMIN_ACTION_LABEL, ADD_ADMIN_LABEL, NO_ADMINS_LINE } from '../group-hub-labels';
import type { HubAdmin } from '../schemas';
import { HubAdminRow } from './HubAdminRow';

const NO_ADMINS_TITLE = 'KEIN GRUPPEN-ADMIN';

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
      ariaLabel={ADD_ADMIN_ACTION_LABEL}
      onClick={onAdd}
    >
      {ADD_ADMIN_LABEL}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState title={NO_ADMINS_TITLE} description={NO_ADMINS_LINE} />
  ) : (
    rows
  );

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.admins}
      action={action}
      description={GROUP_ADMINS_NOTE}
    >
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
