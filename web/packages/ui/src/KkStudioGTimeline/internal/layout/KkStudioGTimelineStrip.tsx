import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { PPS_VAR } from '../logic/studio-g-lane-kinds';

interface KkStudioGTimelineStripProps extends PropsWithChildren {
  offsetPx: number;
  pixelsPerSecond: number;
  lengthSeconds: number;
}

export const KkStudioGTimelineStrip: FC<KkStudioGTimelineStripProps> = ({
  offsetPx,
  pixelsPerSecond,
  lengthSeconds,
  children,
}) => {
  const place = {
    [PPS_VAR]: String(pixelsPerSecond),
    width: `${lengthSeconds * pixelsPerSecond}px`,
    transform: `translate3d(${-offsetPx}px, 0, 0)`,
  };

  return (
    <Box
      data-kk-studio-g-strip
      style={place}
      sx={{
        position: 'relative',
        left: '50%',
        display: 'grid',
        alignContent: 'start',
        rowGap: '1px',
        willChange: 'transform',
      }}
    >
      {children}
    </Box>
  );
};
