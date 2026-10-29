import Box from '@mui/material/Box';
import type { FC } from 'react';

const PERCENT = 100;

export interface KkStudioDStageWayPoint {
  x: number;
  y: number;
}

interface KkStudioDStageWayProps {
  points: readonly KkStudioDStageWayPoint[];
}

export const KkStudioDStageWay: FC<KkStudioDStageWayProps> = ({ points }) => {
  const line = points.map((point) => `${point.x * PERCENT},${point.y * PERCENT}`).join(' ');

  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      data-kk-studio-d-way
      sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
    >
      <Box
        component="polyline"
        points={line}
        sx={(theme) => ({
          fill: 'none',
          stroke: (theme.vars ?? theme).palette.primary.main,
          strokeWidth: 2.5,
          strokeDasharray: '1 6',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          vectorEffect: 'non-scaling-stroke',
          opacity: 0.85,
          transition: 'opacity .4s ease-out',
        })}
      />
    </Box>
  );
};
