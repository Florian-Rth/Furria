import { KkStartTile } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useGroupsTile } from '../hooks/use-groups-tile';
import type { StartPanelOf } from '../start-board';

const TILE_LABEL = 'Gruppen';
const HEAD_LABEL = 'GRUPPEN';

interface GroupsTileProps {
  panel: StartPanelOf<'groups'>;
  order: number;
}

export const GroupsTile: FC<GroupsTileProps> = ({ panel, order }) => {
  const tile = useGroupsTile(panel);
  const jubilees = tile.jubilees.map((jubilee) => (
    <KkStartTile.Jubilee
      key={jubilee.key}
      years={jubilee.years}
      name={jubilee.name}
      meta={jubilee.meta}
      tone={jubilee.tone}
      reach={jubilee.reach}
    />
  ));

  return (
    <KkStartTile label={TILE_LABEL} order={order}>
      <KkStartTile.Head icon="group" label={HEAD_LABEL} reach={tile.reach} />
      <Stack sx={{ gap: 1, minWidth: 0 }}>{jubilees}</Stack>
    </KkStartTile>
  );
};
