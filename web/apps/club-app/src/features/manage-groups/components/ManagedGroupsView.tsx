import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import type { ManagedGroupsListing } from '../hooks/use-managed-groups-listing';
import type { ManagedGroupKind } from '../schemas';
import { GroupKindsPanel } from './GroupKindsPanel';
import { GroupRegister } from './GroupRegister';

const VIEW_SPACING = { xs: 3, desktop: 3.5 };
const FULL_WIDTH = { xs: 12 };
const REGISTER_SLOT = { minWidth: 0, order: 1 } as const;
const KINDS_SLOT = { minWidth: 0, order: 2 } as const;

interface ManagedGroupsViewProps {
  kinds: readonly ManagedGroupKind[];
  listing: ManagedGroupsListing;
}

export const ManagedGroupsView: FC<ManagedGroupsViewProps> = ({ kinds, listing }) => {
  const { highlightedKey } = useLanding();

  return (
    <Grid container spacing={VIEW_SPACING} sx={{ minWidth: 0 }}>
      <Grid size={FULL_WIDTH} sx={REGISTER_SLOT}>
        <GroupRegister
          bands={listing.bands}
          filter={listing.filter}
          isFiltered={listing.isFiltered}
          highlightedKey={highlightedKey}
        />
      </Grid>
      <Grid size={FULL_WIDTH} sx={KINDS_SLOT}>
        <GroupKindsPanel kinds={kinds} highlightedKey={highlightedKey} />
      </Grid>
    </Grid>
  );
};
