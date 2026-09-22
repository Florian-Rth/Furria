import { KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GroupDescriptionPanel } from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
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
