import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

const VIEW_WIDTH = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkStudioIStagePoint {
  x: number;
  y: number;
}

export interface KkStudioIStagePath {
  key: string;
  points: readonly KkStudioIStagePoint[];
  selected: boolean;
}

interface KkStudioIStagePathsProps {
  paths: readonly KkStudioIStagePath[];
  aspect: number;
}

export const KkStudioIStagePaths: FC<KkStudioIStagePathsProps> = ({ paths, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const lines = paths.map((path) => (
    <polyline
      key={path.key}
      data-selected={path.selected}
      points={path.points
        .map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`)
        .join(' ')}
      vectorEffect="non-scaling-stroke"
    />
  ));

  return (
    <Box
      component="svg"
      aria-hidden
      data-kk-studio-i-paths
      viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
      preserveAspectRatio="none"
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        '& polyline': {
          stroke: palette(theme).text.secondary,
          strokeWidth: 1.5,
          strokeDasharray: '4 4',
          opacity: 0.7,
        },
        '& polyline[data-selected="true"]': {
          stroke: palette(theme).primary.main,
          strokeWidth: 3,
          strokeDasharray: 'none',
          opacity: 1,
        },
      })}
    >
      {lines}
    </Box>
  );
};
