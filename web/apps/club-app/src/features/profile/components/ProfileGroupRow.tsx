import { KkChip, KkSummaryRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { MyGroupSummary } from '@/features/group-hub';
import { GROUP_ADMIN_CHIP } from '@/lib/state-chips';

const HUB_PATH = '/groups/$groupId';

interface ProfileGroupRowProps {
  group: MyGroupSummary;
}

export const ProfileGroupRow: FC<ProfileGroupRowProps> = ({ group }) => {
  const params = { groupId: String(group.groupId) };

  const adminChip = group.isAdmin ? (
    <KkChip tone={GROUP_ADMIN_CHIP.tone} dot={GROUP_ADMIN_CHIP.dot} size="small">
      {GROUP_ADMIN_CHIP.label}
    </KkChip>
  ) : null;

  return (
    <KkSummaryRow
      title={group.name}
      trailing={adminChip}
      compactTrailing={adminChip}
      component={Link}
      to={HUB_PATH}
      params={params}
    />
  );
};
