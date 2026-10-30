import { KkRule } from '@furria/ui/KkRule';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { SeasonA } from '../hooks/use-season-a';
import { ROW_HEIGHT } from '../raster-geometry';
import type { RasterActRow } from '../season-raster';
import { RasterCell } from './RasterCell';

interface RasterLineProps {
  row: RasterActRow;
  season: SeasonA;
  columns: string;
}

export const RasterLine: FC<RasterLineProps> = ({ row, season, columns }) => {
  const cells = season.evenings.map((evening, column) => (
    <RasterCell
      key={evening.eventId}
      act={row.act}
      evening={evening}
      spot={{ line: row.line, column }}
      season={season}
    />
  ));

  return (
    <Stack sx={{ height: ROW_HEIGHT, minWidth: 0 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: columns, flex: 1, minHeight: 0 }}>
        {cells}
      </Box>
      <KkRule weight="hair" />
    </Stack>
  );
};
