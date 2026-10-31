import { KkPanelHeader } from '@furria/ui/KkPanelHeader';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupsSection } from '../groups-labels';
import { GroupsGrid } from './GroupsGrid';

const SECTION_GAP = { xs: 1.75, desktop: 2 };

interface GroupsRackSectionProps {
  section: GroupsSection;
}

export const GroupsRackSection: FC<GroupsRackSectionProps> = ({ section }) => {
  const heading = section.title === null ? null : <KkPanelHeader title={section.title} />;

  return (
    <Stack sx={{ gap: SECTION_GAP, minWidth: 0 }}>
      {heading}
      <GroupsGrid groups={section.groups} />
    </Stack>
  );
};
