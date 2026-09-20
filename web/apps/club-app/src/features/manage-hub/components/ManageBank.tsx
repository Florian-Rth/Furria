import { KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { ManageBankModel } from '../manage-hub-labels';
import { ManageTile } from './ManageTile';

const TILE_SPACING = { xs: 1.5, desktop: 2 };
const TILE_SIZE = { xs: 6, sm: 4, desktop: 12 };
const WIDE_TILE_SIZE = { xs: 12, sm: 4, desktop: 12 };
const FULL_HEIGHT = { height: '100%' } as const;
const CELL_SX = { minWidth: 0 } as const;

interface ManageBankProps {
  bank: ManageBankModel;
}

export const ManageBank: FC<ManageBankProps> = ({ bank }) => {
  const cells = bank.tiles.map((entry) => (
    <Grid key={entry.tile.id} size={entry.isWide ? WIDE_TILE_SIZE : TILE_SIZE} sx={CELL_SX}>
      <ManageTile tile={entry.tile} sx={FULL_HEIGHT} />
    </Grid>
  ));

  return (
    <KkPanelSection title={bank.title}>
      <Grid container spacing={TILE_SPACING} sx={CELL_SX}>
        {cells}
      </Grid>
    </KkPanelSection>
  );
};
