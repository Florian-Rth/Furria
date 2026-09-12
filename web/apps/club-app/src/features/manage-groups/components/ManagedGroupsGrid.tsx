import { KkEmptyState, KkPanel } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { MANAGED_GROUPS_EMPTY } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupCard } from './ManagedGroupCard';

const CARD_SIZE = { xs: 12, desktop: 4 };

interface ManagedGroupsGridProps {
  groups: readonly ManagedGroupSummary[];
  onSelect: (groupId: number) => void;
  isFiltered: boolean;
}

export const ManagedGroupsGrid: FC<ManagedGroupsGridProps> = ({ groups, onSelect, isFiltered }) => {
  if (groups.length === 0) {
    const empty = isFiltered ? MANAGED_GROUPS_EMPTY.filtered : MANAGED_GROUPS_EMPTY.cold;

    return (
      <KkPanel variant="block">
        <KkEmptyState title={empty.title} description={empty.description} />
      </KkPanel>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, desktop: 2.5 }} sx={{ minWidth: 0 }}>
      {groups.map((group) => (
        <Grid key={group.groupId} size={CARD_SIZE} sx={{ minWidth: 0 }}>
          <ManagedGroupCard group={group} onSelect={onSelect} />
        </Grid>
      ))}
    </Grid>
  );
};
