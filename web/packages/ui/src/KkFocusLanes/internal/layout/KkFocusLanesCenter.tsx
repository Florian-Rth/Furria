import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkFocusLane } from '../lane-heights';
import { LANE_HEIGHTS } from '../lane-heights';

interface KkFocusLanesCenterProps extends PropsWithChildren {
  lane: KkFocusLane;
}

export const KkFocusLanesCenter: FC<KkFocusLanesCenterProps> = ({ lane, children }) => (
  <Stack
    direction="row"
    sx={{
      height: LANE_HEIGHTS[lane],
      alignItems: 'center',
      justifyContent: 'center',
      px: 1,
      '& > *': { pointerEvents: 'auto' },
    }}
  >
    {children}
  </Stack>
);
