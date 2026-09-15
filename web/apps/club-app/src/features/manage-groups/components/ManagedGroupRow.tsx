import { KkChip, KkSelectRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toGroupCountLine, toManagedGroupChips } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

const MANAGE_GROUPS_PATH = '/manage/groups';

interface ManagedGroupRowProps {
  group: ManagedGroupSummary;
  selected: boolean;
}

export const ManagedGroupRow: FC<ManagedGroupRowProps> = ({ group, selected }) => {
  const status = toManagedGroupChips(group).status;

  const trailing =
    status === null ? null : (
      <KkChip tone={status.tone} dot={status.dot} size="small">
        {status.label}
      </KkChip>
    );

  return (
    <KkSelectRow
      title={group.name}
      meta={toGroupCountLine(group)}
      trailing={trailing}
      selected={selected}
      dimmed={group.archivedOn !== null}
      component={Link}
      to={MANAGE_GROUPS_PATH}
      search={(previous) => ({ ...previous, group: group.groupId })}
    />
  );
};
