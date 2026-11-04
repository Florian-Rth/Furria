import { KkStartTile } from '@furria/ui/KkStartTile';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useBeerTabTile } from '../hooks/use-beer-tab-tile';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';

const TILE_LABEL = 'Dein Deckel';
const HEAD_LABEL = 'DEIN DECKEL';
const TITLE_LINES = 2;

interface BeerTabTileProps {
  panel: StartPanelOf<'beerTab'>;
  board: StartBoard;
  order: number;
}

export const BeerTabTile: FC<BeerTabTileProps> = ({ panel, board, order }) => {
  const tile = useBeerTabTile(panel, board.now);
  const lines = tile.lines.map((line) => (
    <KkStartTile.Line
      key={line.key}
      title={line.title}
      meta={line.meta}
      lines={TITLE_LINES}
      reach={line.reach}
    />
  ));

  return (
    <KkStartTile label={TILE_LABEL} order={order} attention={tile.attention}>
      <KkStartTile.Head icon="fees" label={HEAD_LABEL} />
      <Stack sx={{ gap: 1, minWidth: 0 }}>{lines}</Stack>
    </KkStartTile>
  );
};
