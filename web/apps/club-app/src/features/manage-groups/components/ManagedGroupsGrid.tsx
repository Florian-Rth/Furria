import { KkEmptyState, KkPanel } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { MANAGED_GROUPS_EMPTY } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupCard } from './ManagedGroupCard';

const CARD_SIZE = { xs: 12, sm: 6, desktop: 4 };
const FULL_HEIGHT = { height: '100%' } as const;

interface ManagedGroupsGridProps {
  groups: readonly ManagedGroupSummary[];
  isFiltered: boolean;
  onSelect: (groupId: number) => void;
}

export const ManagedGroupsGrid: FC<ManagedGroupsGridProps> = ({ groups, isFiltered, onSelect }) => {
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
          <ManagedGroupCard
            group={group}
            onSelect={() => {
              onSelect(group.groupId);
            }}
            sx={FULL_HEIGHT}
          />
        </Grid>
      ))}
    </Grid>
  );
};
