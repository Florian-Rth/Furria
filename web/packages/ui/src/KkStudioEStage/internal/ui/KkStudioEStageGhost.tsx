import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export interface KkStudioEStageGhostPoint {
  x: number;
  y: number;
}

const VIEW_WIDTH = 100;
const PERCENT = 100;
const FADE = 'opacity 280ms ease-out';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioEStageGhostProps {
  points: readonly KkStudioEStageGhostPoint[];
  aspect: number;
}

export const KkStudioEStageGhost: FC<KkStudioEStageGhostProps> = ({ points, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const line = points.map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`).join(' ');
  const last = points.at(-1);
  const shown = points.length >= 2 && last !== undefined;
  const opacity = shown ? 1 : 0;
  const target = {
    transform:
      last === undefined
        ? 'none'
        : `translate3d(calc(${last.x * PERCENT}cqw - 50%), calc(${last.y * PERCENT}cqh - 50%), 0)`,
  };

  return (
    <Box
      aria-hidden
      data-kk-studio-e-ghost
      style={{ opacity }}
      sx={{ position: 'absolute', inset: 0, transition: FADE }}
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
          strokeWidth: 4,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          opacity: 0.5,
        })}
      >
        <polyline points={line} vectorEffect="non-scaling-stroke" />
      </Box>
      <Box
        style={target}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: 0,
          width: { xs: '2.25rem', desktop: '3rem' },
          height: { xs: '2.25rem', desktop: '3rem' },
          borderRadius: '50%',
          border: `${kkTokens.line.section}px dashed ${palette(theme).primary.main}`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
        })}
      />
    </Box>
  );
};
