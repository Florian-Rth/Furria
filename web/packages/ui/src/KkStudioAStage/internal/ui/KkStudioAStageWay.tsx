import Box from '@mui/material/Box';
import type { FC } from 'react';

export interface KkStudioAStageWayPoint {
  x: number;
  y: number;
}

const VIEW_WIDTH = 100;
const TARGET_RADIUS = 2.4;

interface KkStudioAStageWayProps {
  points: readonly KkStudioAStageWayPoint[];
  aspect: number;
}

export const KkStudioAStageWay: FC<KkStudioAStageWayProps> = ({ points, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const line = points.map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`).join(' ');
  const last = points.at(-1);
  const target =
    last === undefined ? null : (
      <circle cx={last.x * VIEW_WIDTH} cy={last.y * viewHeight} r={TARGET_RADIUS} />
    );

  if (points.length < 2) {
    return null;
  }

  return (
    <Box
      component="svg"
      aria-hidden
      data-kk-studio-a-way
      viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
      preserveAspectRatio="none"
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        fill: 'none',
        stroke: (theme.vars ?? theme).palette.primary.main,
        strokeWidth: 0.7,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        '& polyline': { strokeDasharray: '1.6 1.4', opacity: 0.9 },
        '& circle': { strokeWidth: 0.8, strokeDasharray: '1.2 1' },
      })}
    >
      <polyline points={line} />
      {target}
    </Box>
  );
};
