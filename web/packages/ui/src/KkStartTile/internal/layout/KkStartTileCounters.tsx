import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const PHONE_COLUMNS = 3;
const COUNTER_MIN = '7rem';

const countersPaint = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${PHONE_COLUMNS}, minmax(0, 1fr))`,
  gap: 0.75,
  m: 0,
  p: 0,
  listStyle: 'none',
  minWidth: 0,
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: `repeat(auto-fill, minmax(${COUNTER_MIN}, 1fr))`,
  },
});

export const KkStartTileCounters: FC<PropsWithChildren> = ({ children }) => (
  <Box component="ul" data-kk-start-tile-counters sx={countersPaint}>
    {children}
  </Box>
);
