import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const SPOT_REST = 1;
const SPOT_LIFT = 3;

interface KkHonourSpotProps extends PropsWithChildren {
  x: number;
  y: number;
  share: number;
}

export const KkHonourSpot: FC<KkHonourSpotProps> = ({ x, y, share, children }) => {
  const left = `${x}%`;
  const top = `${y}%`;
  const width = `${share * 100}%`;

  return (
    <Box
      component="span"
      data-kk-honour-spot
      sx={{
        position: 'absolute',
        left,
        top,
        width,
        aspectRatio: '1',
        display: 'block',
        transform: 'translate(-50%, -50%)',
        zIndex: SPOT_REST,
        '&:hover, &:focus-within': { zIndex: SPOT_LIFT },
      }}
    >
      {children}
    </Box>
  );
};
