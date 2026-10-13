import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

const FACT_MIN = '8.5rem';

interface KkReadoutFactsProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkReadoutFacts: FC<KkReadoutFactsProps> = ({ sx, children }) => (
  <Box
    component="dl"
    data-kk-readout-facts
    sx={[
      {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${FACT_MIN}, 1fr))`,
        columnGap: 2,
        rowGap: 1.25,
        m: 0,
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);
