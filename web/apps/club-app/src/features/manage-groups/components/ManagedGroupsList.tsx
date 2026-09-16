import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import { MANAGED_GROUPS_EMPTY } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupRow } from './ManagedGroupRow';

interface ManagedGroupsListProps {
  groups: readonly ManagedGroupSummary[];
  selectedId: number | null;
  isFiltered: boolean;
}

export const ManagedGroupsList: FC<ManagedGroupsListProps> = ({
  groups,
  selectedId,
  isFiltered,
}) => {
  if (groups.length === 0) {
    const empty = isFiltered ? MANAGED_GROUPS_EMPTY.filtered : MANAGED_GROUPS_EMPTY.cold;

    return (
      <KkPanel variant="block">
        <KkEmptyState title={empty.title} description={empty.description} />
      </KkPanel>
    );
  }

  return (
    <KkPanel variant="list">
      {groups.map((group) => (
        <ManagedGroupRow
          key={group.groupId}
          group={group}
          selected={group.groupId === selectedId}
        />
      ))}
    </KkPanel>
  );
};
