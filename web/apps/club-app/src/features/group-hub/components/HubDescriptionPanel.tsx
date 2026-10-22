import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { GroupDescriptionPanel } from '@/features/group-detail/components/GroupDescriptionPanel';
import type { GroupTone } from '@/features/groups/group-identity';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

interface HubDescriptionPanelProps {
  tone: GroupTone;
  groupName: string;
  description: string;
}

export const HubDescriptionPanel: FC<HubDescriptionPanelProps> = ({
  tone,
  groupName,
  description,
}) => (
  <KkPanelSection title={GROUP_SECTION_TITLES.description} groupTone={tone}>
    <GroupDescriptionPanel groupName={groupName} description={description} />
  </KkPanelSection>
);
