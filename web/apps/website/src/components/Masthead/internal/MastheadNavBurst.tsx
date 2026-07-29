import { KkConfettiBurst } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { NavBurst } from './nav-burst';

interface MastheadNavBurstProps {
  burst: NavBurst;
}

export const MastheadNavBurst: FC<MastheadNavBurstProps> = ({ burst }) => (
  <Box
    aria-hidden
    sx={{
      position: 'absolute',
      left: burst.x,
      top: burst.y,
      width: 0,
      height: 0,
      pointerEvents: 'none',
      display: { desktop: 'none' },
    }}
  >
    <KkConfettiBurst fireKey={burst.fireKey} count={14} />
  </Box>
);
