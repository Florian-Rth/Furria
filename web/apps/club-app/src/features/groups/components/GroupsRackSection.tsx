import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupsSection } from '../groups-labels';
import { GroupsGrid } from './GroupsGrid';
import { GroupsSectionHeading } from './GroupsSectionHeading';

const SECTION_GAP = { xs: 1.75, desktop: 2 };

interface GroupsRackSectionProps {
  section: GroupsSection;
}

export const GroupsRackSection: FC<GroupsRackSectionProps> = ({ section }) => {
  const heading =
    section.title === null ? null : (
      <GroupsSectionHeading title={section.title} count={section.groups.length} />
    );

  return (
    <Stack sx={{ gap: SECTION_GAP, minWidth: 0 }}>
      {heading}
      <GroupsGrid groups={section.groups} />
    </Stack>
  );
};
