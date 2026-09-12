import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC, Ref } from 'react';
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
  viewerIsAffiliated: boolean;
  newPersonId: number | null;
  titleRef: Ref<HTMLHeadingElement>;
  onAdd: () => void;
  onEnd: (groupAdminId: number) => void;
}

export const HubAdminsPanel: FC<HubAdminsPanelProps> = ({
  admins,
  canManage,
  viewerIsAffiliated,
  newPersonId,
  titleRef,
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
        viewerIsAffiliated={viewerIsAffiliated}
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
    <KkEmptyState size="panel" title={NO_ADMINS_TITLE} description={NO_ADMINS_LINE} />
  ) : (
    rows
  );

  return (
    <KkPanelSection
      title={GROUP_SECTION_TITLES.admins}
      titleRef={titleRef}
      action={action}
      description={GROUP_ADMINS_NOTE}
    >
      <KkPanel variant={variant}>{body}</KkPanel>
    </KkPanelSection>
  );
};
