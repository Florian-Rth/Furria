import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GROUP_ADMINS_NOTE } from '@/lib/group-sections';
import { ADD_ADMIN_LABEL, MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import type { ManagedAdmin } from '../schemas';
import { OverrideAdminRow } from './OverrideAdminRow';

const ADD_TEXT = 'Admin';
const EMPTY_TITLE = 'KEIN GRUPPEN-ADMIN';
const EMPTY_DESCRIPTION =
  'Für diese Gruppe ist gerade niemand als Gruppen-Admin eingetragen. Ohne Admin pflegt die Gruppenverwaltung sie allein.';

interface OverrideAdminsPanelProps {
  admins: readonly ManagedAdmin[];
  canManage: boolean;
  canOpenPerson: boolean;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const OverrideAdminsPanel: FC<OverrideAdminsPanelProps> = ({
  admins,
  canManage,
  canOpenPerson,
  onAdd,
  onEnd,
}) => {
  const rows = admins.map((admin) => (
    <OverrideAdminRow
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
      ariaLabel={ADD_ADMIN_LABEL}
      onClick={onAdd}
    >
      {ADD_TEXT}
    </KkButton>
  ) : null;

  const body = isEmpty ? (
    <KkEmptyState title={EMPTY_TITLE} description={EMPTY_DESCRIPTION} />
  ) : (
    rows
  );

  return (
    <KkPanelSection
      title={MANAGE_GROUPS_SECTION_TITLES.admins}
      action={action}
      description={GROUP_ADMINS_NOTE}
    >
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
