import { KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { GroupDescriptionPanel } from '@/features/group-detail';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';

interface GroupDescriptionProps {
  groupName: string;
  description: string;
}

export const GroupDescription: FC<GroupDescriptionProps> = ({ groupName, description }) => (
  <KkPanelSection title={GROUP_SECTION_TITLES.about}>
    <GroupDescriptionPanel groupName={groupName} description={description} />
  </KkPanelSection>
);
