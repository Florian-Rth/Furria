import type { KkPanelAction } from '@furria/ui';
import { KkPanelSection } from '@furria/ui';
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
  const action: KkPanelAction | undefined = canManage
    ? { label: EDIT_LABEL, icon: 'edit', ariaLabel: EDIT_ACTION_LABEL, onClick: onEdit }
    : undefined;

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.description} groupTone={tone} action={action}>
      <GroupDescriptionPanel groupName={groupName} description={description} />
    </KkPanelSection>
  );
};
