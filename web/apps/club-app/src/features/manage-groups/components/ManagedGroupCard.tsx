import type { KkSx } from '@furria/ui';
import { KkChip, KkMeta } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GroupCardBody } from '@/features/groups';
import { toInitials } from '@/lib/initials';
import { toGroupCountLine, toManagedGroupChips } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const MANAGE_GROUPS_PATH = '/manage/groups';

interface ManagedGroupCardProps {
  group: ManagedGroupSummary;
  sx?: KkSx;
}

export const ManagedGroupCard: FC<ManagedGroupCardProps> = ({ group, sx }) => {
  const { status, openness } = toManagedGroupChips(group);
  const isArchived = group.archivedOn !== null;
  const adminInitials = group.admins.map((person) => toInitials(person.firstName, person.lastName));
  const countLine = toGroupCountLine(group);

  const statusChip =
    status === null ? null : (
      <KkChip tone={status.tone} dot={status.dot} size="small">
        {status.label}
      </KkChip>
    );

  const chips = (
    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', minWidth: 0 }}>
      {statusChip}
      <KkChip tone={openness.tone} dot={openness.dot} size="small">
        {openness.label}
      </KkChip>
    </Stack>
  );

  return (
    <GroupCardBody
      name={group.name}
      memberCount={group.memberCount}
      description={group.description}
      initials={adminInitials}
      total={group.admins.length}
      chips={chips}
      footer={<KkMeta>{countLine}</KkMeta>}
      dimmed={isArchived}
      to={MANAGE_GROUPS_PATH}
      search={{ group: group.groupId }}
      sx={sx}
    />
  );
};
