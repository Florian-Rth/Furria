import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import {
  ADD_ADMIN_ACTION_LABEL,
  ADD_ADMIN_LABEL,
  GroupAdminRow,
  NO_ADMINS_TITLE,
} from '@/features/group-detail';
import { GROUP_ADMINS_NOTE, GROUP_SECTION_TITLES, NO_ADMINS_LINE } from '@/lib/group-sections';

interface HubAdminsPanelProps {
  admins: readonly GroupDetailAdmin[];
  canManage: boolean;
  canOpenPerson: boolean;
  newPersonId: number | null;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminsPanel: FC<HubAdminsPanelProps> = ({
  admins,
  canManage,
  canOpenPerson,
  newPersonId,
  onAdd,
  onEnd,
}) => {
  const rows = admins.map((admin) => {
    const end = (): void => {
      onEnd(admin.groupAdminId);
    };

    return (
      <GroupAdminRow
        key={admin.groupAdminId}
        admin={admin}
        canManage={canManage}
        canOpenPerson={canOpenPerson}
        onEnd={end}
        isNew={admin.personId === newPersonId}
      />
    );
  });

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
