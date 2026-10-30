import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import {
  TWIN_BAND,
  TWIN_BAND_MIN,
  TWIN_COLUMN,
  TWIN_HEIGHT,
  TWIN_OPEN,
  TWIN_SPINE_MIN,
  TWIN_TIGHT,
  TWIN_WIDE,
  TWIN_WIDTH,
} from '../twin-query';

const BAND_GRID: CSSObject = {
  height: `var(${TWIN_BAND})`,
  gridTemplateAreas: '"eyebrow cue" "name count" "note note"',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gridTemplateRows: '1.75rem auto minmax(0, 1fr)',
  columnGap: '1.5rem',
  rowGap: '0.25rem',
};

interface KkTwinSpineProps {
  label: string;
}

export const KkTwinSpine: FC<PropsWithChildren<KkTwinSpineProps>> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-twin-spine
    sx={{
      gridArea: 'spine',
      display: 'grid',
      width: `min(100cqw, max(var(${TWIN_WIDTH}), ${TWIN_BAND_MIN}))`,
      minWidth: 0,
      ...BAND_GRID,
      [TWIN_WIDE]: {
        width: TWIN_COLUMN,
        height: `min(100cqh, max(var(${TWIN_HEIGHT}), ${TWIN_SPINE_MIN}))`,
        gridTemplateAreas: '"eyebrow eyebrow" "name name" "count cue" "note note"',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
        rowGap: '0.5rem',
        columnGap: '0.75rem',
      },
      [TWIN_OPEN]: { ...BAND_GRID, width: 'auto', justifySelf: 'stretch' },
      [TWIN_TIGHT]: {
        width: 'auto',
        justifySelf: 'stretch',
        gridTemplateAreas: '"eyebrow eyebrow" "name name" "count cue" "note note"',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gridTemplateRows: '1.25rem auto auto minmax(0, 1fr)',
        rowGap: '0.25rem',
      },
    }}
  >
    {children}
  </Box>
);
