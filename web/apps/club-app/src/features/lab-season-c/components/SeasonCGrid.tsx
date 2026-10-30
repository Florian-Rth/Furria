import { KkRule } from '@furria/ui/KkRule';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonCState } from '../hooks/use-season-c';
import { SPOT_ATTRIBUTE, useSeasonCKeys } from '../hooks/use-season-c-keys';
import { GRID_LABEL } from '../season-c-copy';
import { spotKeyOf } from '../season-c-keys';
import { LEFT_WIDTH, ROW_HEIGHT, SNAP } from '../season-c-layout';
import { SeasonCActCell } from './SeasonCActCell';
import { SeasonCActsHead } from './SeasonCActsHead';
import { SeasonCEveningColumn } from './SeasonCEveningColumn';

interface SeasonCGridProps {
  season: SeasonCState;
}

export const SeasonCGrid: FC<SeasonCGridProps> = ({ season }) => {
  const onKeyDown = useSeasonCKeys(season.rows.length, season.evenings.length + 1);
  const actCells = season.rows.map((row, index) => (
    <Box key={row.actId}>
      <Box
        {...{ [SPOT_ATTRIBUTE]: spotKeyOf({ row: index, column: 0 }) }}
        sx={{ height: ROW_HEIGHT, display: 'grid', alignItems: 'center', minWidth: 0 }}
      >
        <SeasonCActCell row={row} />
      </Box>
      <KkRule weight="hair" />
    </Box>
  ));
  const columns = season.evenings.map((evening, index) => (
    <SeasonCEveningColumn
      key={evening.eventId}
      evening={evening}
      column={index + 1}
      rows={season.rows}
    />
  ));

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={GRID_LABEL}
      onKeyDown={onKeyDown}
      sx={{ minWidth: 0, alignItems: 'flex-start' }}
    >
      <Stack sx={{ width: LEFT_WIDTH, flexShrink: 0, minWidth: 0, pr: 1 }}>
        <SeasonCActsHead />
        {actCells}
      </Stack>
      <Stack
        direction="row"
        sx={{
          flex: 1,
          minWidth: 0,
          overflowX: 'auto',
          scrollSnapType: SNAP,
          overscrollBehaviorX: 'contain',
        }}
      >
        {columns}
      </Stack>
    </Stack>
  );
};
