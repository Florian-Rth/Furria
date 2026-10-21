import { KkMeta, KkStartTile } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useMineTile } from '../hooks/use-mine-tile';
import type { StartBoard } from '../hooks/use-start-view';
import type { StartPanelOf } from '../start-board';

const TILE_LABEL = 'Du';
const HEAD_LABEL = 'DU';

interface MineTileProps {
  panel: StartPanelOf<'mine'>;
  board: StartBoard;
  order: number;
}

export const MineTile: FC<MineTileProps> = ({ panel, board, order }) => {
  const tile = useMineTile(panel, board);
  const lines = tile.facts.map((fact) => (
    <KkStartTile.Line
      key={fact.key}
      title={fact.title}
      meta={fact.meta}
      lines={2}
      lead={
        <KkStartTile.Coin
          icon={fact.coin.icon}
          glyph={fact.coin.glyph}
          tone={fact.coin.tone}
          groupTone={fact.coin.groupTone}
        />
      }
    />
  ));
  const further = tile.further === null ? null : <KkMeta>{tile.further}</KkMeta>;

  return (
    <KkStartTile label={TILE_LABEL} order={order} attention={tile.attention}>
      <KkStartTile.Head icon="person" label={HEAD_LABEL} reach={tile.reach} />
      <Stack sx={{ gap: 1, minWidth: 0 }}>{lines}</Stack>
      {further}
    </KkStartTile>
  );
};
