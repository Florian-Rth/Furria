import { KkButton, KkIcon, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GroupDescriptionPanel } from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

const EDIT_LABEL = 'Pflegen';
const EDIT_ACTION_LABEL = 'Angaben zur Gruppe pflegen';

interface HubDescriptionPanelProps {
  tone: GroupTone;
  groupName: string;
  description: string;
  canManage: boolean;
  onEdit: () => void;
}

export const HubDescriptionPanel: FC<HubDescriptionPanelProps> = ({
  tone,
  groupName,
  description,
  canManage,
  onEdit,
}) => {
  const action = canManage ? (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      ariaLabel={EDIT_ACTION_LABEL}
      onClick={onEdit}
    >
      {EDIT_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.description} groupTone={tone} action={action}>
      <GroupDescriptionPanel groupName={groupName} description={description} />
    </KkPanelSection>
  );
};
