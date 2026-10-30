import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export interface KkStudioGStagePoint {
  x: number;
  y: number;
}

const VIEW = 100;

interface KkStudioGStageTrailProps {
  points: readonly KkStudioGStagePoint[];
}

export const KkStudioGStageTrail: FC<KkStudioGStageTrailProps> = ({ points }) => {
  const line = points.map((point) => `${point.x * VIEW},${point.y * VIEW}`).join(' ');
  const last = points.at(-1);
  const end =
    last === undefined ? null : (
      <Box
        component="circle"
        cx={last.x * VIEW}
        cy={last.y * VIEW}
        r={1.1}
        sx={{ fill: 'currentColor' }}
      />
    );

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="none"
      data-kk-studio-g-trail
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        color: 'text.primary',
        pointerEvents: 'none',
      }}
    >
      <Box
        component="polyline"
        points={line}
        vectorEffect="non-scaling-stroke"
        sx={{
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: kkTokens.line.section,
          strokeDasharray: '5 4',
          strokeLinecap: 'round',
          opacity: 0.7,
        }}
      />
      {end}
    </Box>
  );
};
