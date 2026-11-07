import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { LANE_PHONE_WIDE } from '../lane-phone-query';

export const KkLanePhoneWork: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-lane-phone-work
    sx={{
      minHeight: 0,
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridAutoRows: 'auto',
      gap: 1,
      [LANE_PHONE_WIDE]: {
        gridTemplateRows: 'minmax(0, 1fr)',
        gridAutoRows: 'auto',
        alignContent: 'start',
      },
    }}
  >
    {children}
  </Box>
);
