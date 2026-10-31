import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { useStartMosaic } from '../hooks/use-start-mosaic';
import type { StartBoard } from '../hooks/use-start-view';
import { AnnouncementsSheet } from './AnnouncementsSheet';
import { CalendarSheet } from './CalendarSheet';
import { EntrySheet } from './EntrySheet';
import { OwedSheet } from './OwedSheet';
import { PanelLinesSheet } from './PanelLinesSheet';
import { PanelTile } from './PanelTile';
import { PracticeSheet } from './PracticeSheet';
import { RoleSheet } from './RoleSheet';

const TILE_SPACING = 1.5;
const FULL = 12;
const SIDE_STACK = { gap: TILE_SPACING, height: '100%' } as const;
const GROWING_SLOT = { flexGrow: 1, minWidth: 0 } as const;
const FIXED_SLOT = { minWidth: 0 } as const;
const NARROW_ONLY = { display: { lg: 'none' } } as const;

interface StartTilesProps {
  board: StartBoard;
  focusedDay: string | null;
  strip: ReactNode;
}

export const StartTiles: FC<StartTilesProps> = ({ board, focusedDay, strip }) => {
  const mosaic = useStartMosaic(board);

  const stripCell =
    strip === null ? null : (
      <Grid size={FULL} sx={NARROW_ONLY}>
        {strip}
      </Grid>
    );
  const lead =
    mosaic.lead === null ? null : (
      <Grid size={mosaic.lead.span}>
        <PanelTile panel={mosaic.lead.panel} board={board} order={mosaic.lead.order} />
      </Grid>
    );
  const sideTiles = mosaic.side.map((tile) => (
    <Box key={tile.panel.kind} sx={tile.grows ? GROWING_SLOT : FIXED_SLOT}>
      <PanelTile panel={tile.panel} board={board} order={tile.order} />
    </Box>
  ));
  const side =
    sideTiles.length === 0 ? null : (
      <Grid size={mosaic.sideSpan}>
        <Stack sx={SIDE_STACK}>{sideTiles}</Stack>
      </Grid>
    );
  const rest = mosaic.rest.map((tile) => (
    <Grid key={tile.panel.kind} size={tile.span}>
      <PanelTile panel={tile.panel} board={board} order={tile.order} />
    </Grid>
  ));

  return (
    <>
      <Grid container spacing={TILE_SPACING} sx={{ alignItems: 'stretch', mt: -1 }}>
        {stripCell}
        {lead}
        {side}
        {rest}
      </Grid>
      <EntrySheet board={board} />
      <CalendarSheet board={board} focusedDay={focusedDay} />
      <AnnouncementsSheet board={board} />
      <RoleSheet variant="role" board={board} />
      <RoleSheet variant="office" board={board} />
      <PanelLinesSheet kind="mine" board={board} />
      <PanelLinesSheet kind="groups" board={board} />
      <OwedSheet board={board} />
      <PracticeSheet board={board} />
    </>
  );
};
