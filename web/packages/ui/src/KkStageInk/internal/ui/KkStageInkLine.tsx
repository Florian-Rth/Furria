import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';

export type KkStageInkLineKind = 'way' | 'ghost';

export interface KkStageInkPoint {
  x: number;
  y: number;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const strokes: Record<KkStageInkLineKind, CSSObject> = {
  way: { strokeWidth: 2.5, strokeDasharray: '1.5 5' },
  ghost: { strokeWidth: 4, opacity: 0.5 },
};

interface KkStageInkLineProps {
  points: readonly KkStageInkPoint[];
  kind: KkStageInkLineKind;
}

export const KkStageInkLine: FC<KkStageInkLineProps> = ({ points, kind }) => {
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Box
      component="svg"
      aria-hidden
      data-kk-stage-line={kind}
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
        fill: 'none',
        stroke: palette(theme).primary.main,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        transition: 'opacity 280ms ease-out',
        ...strokes[kind],
      })}
    >
      <polyline points={line} vectorEffect="non-scaling-stroke" />
    </Box>
  );
};
