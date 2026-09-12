import { KkButton, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { GroupDescriptionPanel } from '@/features/group-detail';
import { GROUP_SECTION_TITLES } from '@/lib/group-sections';
import { GROUP_CARE_LABELS, toGroupCareIntent } from '../groups-labels';
import { useGroupStanding } from '../hooks/use-group-standings';

const HUB_PATH = '/my-groups/$groupId';

interface GroupDescriptionProps {
  groupId: number;
  groupName: string;
  description: string;
}

export const GroupDescription: FC<GroupDescriptionProps> = ({
  groupId,
  groupName,
  description,
}) => {
  const standing = useGroupStanding(groupId);
  const careIntent = toGroupCareIntent(standing);
  const params = { groupId: String(groupId) };

  const hubLink =
    careIntent === null ? null : (
      <KkButton size="small" variant="outlined" component={Link} to={HUB_PATH} params={params}>
        {GROUP_CARE_LABELS[careIntent]}
      </KkButton>
    );

  return (
    <KkPanelSection title={GROUP_SECTION_TITLES.about} action={hubLink}>
      <GroupDescriptionPanel groupName={groupName} description={description} />
    </KkPanelSection>
  );
};
