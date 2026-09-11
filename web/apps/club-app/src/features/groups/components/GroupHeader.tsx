import { KkAppShell, KkChip, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toGroupHeadline } from '../groups-labels';
import type { GroupDetails } from '../schemas';

interface GroupHeaderProps {
  group: GroupDetails | undefined;
}

export const GroupHeader: FC<GroupHeaderProps> = ({ group }) => {
  const headline = toGroupHeadline(group);

  const opennessChip =
    headline.openness === null ? null : (
      <KkChip tone={headline.openness.tone} dot={headline.openness.dot}>
        {headline.openness.label}
      </KkChip>
    );

  const memberCountLine =
    headline.memberCount === null ? null : <KkMeta>{headline.memberCount}</KkMeta>;

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap', minWidth: 0 }}
      >
        <KkAppShell.PageTitle>{headline.title}</KkAppShell.PageTitle>
        {opennessChip}
      </Stack>
      {memberCountLine}
    </Stack>
  );
};
