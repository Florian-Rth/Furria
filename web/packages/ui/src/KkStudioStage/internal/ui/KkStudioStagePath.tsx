import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkStudioStagePoint } from './KkStudioStageOnion';

const VIEW_WIDTH = 100;
const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioStagePathProps {
  route: readonly KkStudioStagePoint[];
  keys: readonly KkStudioStagePoint[];
  aspect: number;
}

export const KkStudioStagePath: FC<KkStudioStagePathProps> = ({ route, keys, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const line = route.map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`).join(' ');
  const diamonds = keys.map((point) => (
    <Box
      key={point.key}
      style={{
        transform: `translate3d(calc(${point.x * PERCENT}cqw - 50%), calc(${point.y * PERCENT}cqh - 50%), 0) rotate(45deg)`,
      }}
      sx={(theme) => ({
        position: 'absolute',
        left: 0,
        top: 0,
        width: '0.5rem',
        height: '0.5rem',
        backgroundColor: palette(theme).background.paper,
        border: `2px solid ${palette(theme).primary.main}`,
      })}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-studio-path
      sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
        preserveAspectRatio="none"
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          overflow: 'visible',
          fill: 'none',
          stroke: palette(theme).primary.main,
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: '1 5',
        })}
      >
        <polyline points={line} vectorEffect="non-scaling-stroke" />
      </Box>
      {diamonds}
    </Box>
  );
};
