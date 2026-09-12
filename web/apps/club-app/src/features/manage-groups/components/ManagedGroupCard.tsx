import type { KkSx } from '@furria/ui';
import { KkChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GroupCardBody } from '@/features/groups';
import { toManagedGroupChips } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const MANAGE_GROUPS_PATH = '/manage/groups';

interface ManagedGroupCardProps {
  group: ManagedGroupSummary;
  sx?: KkSx;
}

export const ManagedGroupCard: FC<ManagedGroupCardProps> = ({ group, sx }) => {
  const chips = toManagedGroupChips(group);
  const isArchived = group.archivedOn !== null;

  const statusChip =
    chips.status === null ? null : (
      <KkChip tone={chips.status.tone} dot={chips.status.dot} size="small">
        {chips.status.label}
      </KkChip>
    );

  const footer = (
    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', minWidth: 0 }}>
      {statusChip}
      <KkChip tone={chips.openness.tone} dot={chips.openness.dot} size="small">
        {chips.openness.label}
      </KkChip>
    </Stack>
  );

  return (
    <GroupCardBody
      name={group.name}
      memberCount={group.memberCount}
      description={group.description}
      footer={footer}
      dimmed={isArchived}
      to={MANAGE_GROUPS_PATH}
      search={{ group: group.groupId }}
      sx={sx}
    />
  );
};
