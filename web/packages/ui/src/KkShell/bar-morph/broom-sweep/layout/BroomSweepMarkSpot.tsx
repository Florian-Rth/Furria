import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../../tokens';

export const BroomSweepMarkSpot: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'absolute',
      left: 0,
      top: '50%',
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      display: 'grid',
      placeItems: 'center',
      transform: 'translateY(-50%)',
    }}
  >
    {children}
  </Box>
);
