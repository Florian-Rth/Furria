import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useRasterKeys } from '../hooks/use-raster-keys';
import { useRasterScroll } from '../hooks/use-raster-scroll';
import type { SeasonA } from '../hooks/use-season-a';
import {
  COLUMN_VAR,
  EVENING_WIDTH,
  eveningGridOf,
  HEAD_HEIGHT,
  RASTER_COLUMNS,
  RASTER_HEIGHT,
} from '../raster-geometry';
import { RASTER_LABEL } from '../season-a-copy';
import { RasterActHead } from './RasterActHead';
import { RasterCorner } from './RasterCorner';
import { RasterEveningHead } from './RasterEveningHead';
import { RasterGroupGap } from './RasterGroupGap';
import { RasterGroupHead } from './RasterGroupHead';
import { RasterLine } from './RasterLine';

interface SeasonRasterProps {
  season: SeasonA;
  follows: boolean;
}

const SNAP = { xs: 'x mandatory', md: 'none' } as const;

export const SeasonRaster: FC<SeasonRasterProps> = ({ season, follows }) => {
  const { evenings, rows, acts } = season;
  const scroll = useRasterScroll(evenings.length);
  const keys = useRasterKeys(season.lineCount, evenings.length, season.open, season.close, follows);
  const columns = eveningGridOf(evenings.length);
  const heads = evenings.map((evening) => (
    <RasterEveningHead key={evening.eventId} evening={evening} acts={acts} />
  ));
  const sideRows = rows.map((row) =>
    row.kind === 'group' ? (
      <RasterGroupHead key={row.key} row={row} />
    ) : (
      <RasterActHead key={row.key} row={row} />
    ),
  );
  const bodyRows = rows.map((row) =>
    row.kind === 'group' ? (
      <RasterGroupGap key={row.key} />
    ) : (
      <RasterLine key={row.key} row={row} season={season} columns={columns} />
    ),
  );

  return (
    <Box
      component="section"
      aria-label={RASTER_LABEL}
      onKeyDown={keys.onKeyDown}
      onKeyUp={keys.onKeyUp}
      sx={{
        [COLUMN_VAR]: EVENING_WIDTH,
        display: 'grid',
        gridTemplateColumns: RASTER_COLUMNS,
        gridTemplateRows: 'auto minmax(0, 1fr)',
        height: RASTER_HEIGHT,
        minWidth: 0,
      }}
    >
      <RasterCorner season={season} scroll={scroll} />
      <Box
        ref={scroll.headRef}
        onScroll={scroll.onHeadScroll}
        sx={{ minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none', scrollSnapType: SNAP }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: columns, height: HEAD_HEIGHT }}>
          {heads}
        </Box>
      </Box>
      <Box
        ref={scroll.sideRef}
        onScroll={scroll.onSideScroll}
        sx={{ minHeight: 0, minWidth: 0, overflowY: 'auto', scrollbarWidth: 'none' }}
      >
        <Stack sx={{ minWidth: 0, pb: 3 }}>{sideRows}</Stack>
      </Box>
      <Box
        ref={scroll.bodyRef}
        onScroll={scroll.onBodyScroll}
        sx={{
          minHeight: 0,
          minWidth: 0,
          overflow: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: SNAP,
        }}
      >
        <Stack sx={{ minWidth: 0 }}>{bodyRows}</Stack>
      </Box>
    </Box>
  );
};
