import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { HeuteCArea } from '../heute-c-layout';
import { AREA_SHOWN } from '../heute-c-layout';

interface HeuteCSlotProps extends PropsWithChildren {
  area: HeuteCArea;
}

export const HeuteCSlot: FC<HeuteCSlotProps> = ({ area, children }) => (
  <Box
    sx={{
      gridArea: area,
      minWidth: 0,
      minHeight: 0,
      alignContent: 'start',
      ...AREA_SHOWN[area],
    }}
  >
    {children}
  </Box>
);
