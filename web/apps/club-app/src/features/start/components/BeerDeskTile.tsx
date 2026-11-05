import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkStartTile } from '@furria/ui/KkStartTile';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerDeskTile } from '../hooks/use-beer-desk-tile';
import type { StartBeerDeskPanel } from '../schemas';

const TILE_LABEL = 'Bierliste verwalten';
const HEAD_LABEL = 'BIERLISTE';
const BOOK_LABEL = 'Kisten eintragen';
const BOOK_ICON = <KkIcon name="add" size="small" />;

interface BeerDeskTileProps {
  panel: StartBeerDeskPanel;
  order: number;
}

export const BeerDeskTile: FC<BeerDeskTileProps> = ({ panel, order }) => {
  const tile = useBeerDeskTile(panel);
  const stockNote =
    tile.stockNote === null ? null : (
      <KkText variant="caption" tone="secondary">
        {tile.stockNote}
      </KkText>
    );

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="beer" label={HEAD_LABEL} />
      <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
        <KkButton variant="contained" startIcon={BOOK_ICON} onClick={tile.book}>
          {BOOK_LABEL}
        </KkButton>
        {stockNote}
      </Stack>
    </KkStartTile>
  );
};
