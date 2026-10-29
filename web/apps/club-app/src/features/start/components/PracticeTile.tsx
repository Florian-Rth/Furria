import { KkMeta } from '@furria/ui/KkMeta';
import { KkStartTile } from '@furria/ui/KkStartTile';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePracticeTile } from '../hooks/use-practice-tile';
import type { StartPracticePanel } from '../schemas';

const TILE_LABEL = 'Üben';
const HEAD_LABEL = 'ÜBEN';

interface PracticeTileProps {
  panel: StartPracticePanel;
  order: number;
}

export const PracticeTile: FC<PracticeTileProps> = ({ panel, order }) => {
  const tile = usePracticeTile(panel);
  const lines = tile.lines.map((line) => (
    <KkStartTile.Line key={line.key} title={line.title} meta={line.meta} reach={line.reach} />
  ));
  const further = tile.further === null ? null : <KkMeta>{tile.further}</KkMeta>;

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="stage" label={HEAD_LABEL} reach={tile.reach} />
      <Stack sx={{ gap: 1, minWidth: 0 }}>{lines}</Stack>
      {further}
    </KkStartTile>
  );
};
