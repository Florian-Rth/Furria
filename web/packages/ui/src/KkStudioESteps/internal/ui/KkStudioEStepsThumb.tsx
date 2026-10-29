import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

export type KkStudioEStepsThumbKind = 'own' | 'cast' | 'open';

export interface KkStudioEStepsThumbDot {
  key: string;
  x: number;
  y: number;
  kind: KkStudioEStepsThumbKind;
}

const WIDTH = 100;
const RADIUS: Record<KkStudioEStepsThumbKind, number> = { own: 7, cast: 4.5, open: 4.5 };

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioEStepsThumbProps {
  dots: readonly KkStudioEStepsThumbDot[];
  aspect: number;
}

export const KkStudioEStepsThumb: FC<KkStudioEStepsThumbProps> = ({ dots, aspect }) => {
  const height = WIDTH * aspect;
  const marks = dots.map((dot) => (
    <circle
      key={dot.key}
      data-kind={dot.kind}
      cx={dot.x * WIDTH}
      cy={dot.y * height}
      r={RADIUS[dot.kind]}
    />
  ));

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${WIDTH} ${height}`}
      sx={(theme) => ({
        width: '3rem',
        flexShrink: 0,
        aspectRatio: `${1 / aspect}`,
        borderRadius: '0.25rem',
        backgroundColor: palette(theme).action.hover,
        boxShadow: `inset 0 2px 0 ${palette(theme).text.secondary}`,
        '& circle': { fill: palette(theme).text.disabled },
        '& circle[data-kind="open"]': { fill: palette(theme).warning.main },
        '& circle[data-kind="own"]': { fill: palette(theme).primary.main },
      })}
    >
      {marks}
    </Box>
  );
};
