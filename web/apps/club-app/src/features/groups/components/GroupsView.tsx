import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupSummary } from '../schemas';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsGrid } from './GroupsGrid';
import { GroupsIntro } from './GroupsIntro';

interface GroupsViewProps {
  groups: readonly GroupSummary[];
}

export const GroupsView: FC<GroupsViewProps> = ({ groups }) => {
  if (groups.length === 0) {
    return <GroupsEmpty />;
  }

  const recruiting = groups.filter((group) => group.isRecruiting).length;

  return (
    <Stack sx={{ gap: 3, minWidth: 0 }}>
      <GroupsIntro total={groups.length} recruiting={recruiting} />
      <GroupsGrid groups={groups} />
    </Stack>
  );
};
