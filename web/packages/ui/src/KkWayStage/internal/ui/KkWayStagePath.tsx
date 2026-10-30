import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { placeAt, unzoomed } from '../logic/way-zoom';

export interface KkWayStagePoint {
  x: number;
  y: number;
}

const VIEW_WIDTH = 100;
const FADE = 'opacity 280ms ease-out';
const TARGET = { xs: '2.5rem', desktop: '3.25rem' } as const;
const HIDDEN_PLACE = { x: 0, y: 0 } as const;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkWayStagePathProps {
  points: readonly KkWayStagePoint[];
  aspect: number;
}

export const KkWayStagePath: FC<KkWayStagePathProps> = ({ points, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const line = points.map((point) => `${point.x * VIEW_WIDTH},${point.y * viewHeight}`).join(' ');
  const last = points.at(-1) ?? HIDDEN_PLACE;
  const opacity = points.length >= 2 ? 1 : 0;

  return (
    <Box
      aria-hidden
      data-kk-way-path
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
          strokeWidth: 3,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeDasharray: '1 7',
          opacity: 0.8,
        })}
      >
        <polyline points={line} vectorEffect="non-scaling-stroke" />
      </Box>
      <Box
        style={placeAt(last.x, last.y)}
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          top: 0,
          width: unzoomed(TARGET.xs),
          height: unzoomed(TARGET.xs),
          [theme.breakpoints.up('desktop')]: {
            width: unzoomed(TARGET.desktop),
            height: unzoomed(TARGET.desktop),
          },
          borderRadius: '50%',
          border: `${kkTokens.line.section}px dashed ${palette(theme).primary.main}`,
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
        })}
      />
    </Box>
  );
};
