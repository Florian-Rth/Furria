import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { percentOf } from '../../../internal/score-paint';

interface KkTimelineCanvasProps extends PropsWithChildren {
  start: number;
  end: number;
}

export const KkTimelineCanvas: FC<KkTimelineCanvasProps> = ({ start, end, children }) => {
  const span = Math.max(end - start, Number.EPSILON);
  const canvas = { left: percentOf(-start / span), width: percentOf(1 / span) };

  return (
    <Box data-kk-timeline-canvas style={canvas} sx={{ position: 'absolute', top: 0, bottom: 0 }}>
      {children}
    </Box>
  );
};
