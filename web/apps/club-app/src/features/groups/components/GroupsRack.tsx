import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupsSection } from '../groups-labels';
import { GroupsRackSection } from './GroupsRackSection';

const RACK_GAP = { xs: 3, desktop: 4 };

interface GroupsRackProps {
  sections: readonly GroupsSection[];
}

export const GroupsRack: FC<GroupsRackProps> = ({ sections }) => (
  <Stack sx={{ gap: RACK_GAP, minWidth: 0 }}>
    {sections.map((section) => (
      <GroupsRackSection key={section.id} section={section} />
    ))}
  </Stack>
);
