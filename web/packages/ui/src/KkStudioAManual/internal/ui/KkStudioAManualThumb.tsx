import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';

export type KkStudioAManualThumbDotKind = 'own' | 'cast' | 'open';

export interface KkStudioAManualThumbDot {
  key: string;
  x: number;
  y: number;
  kind: KkStudioAManualThumbDotKind;
}

const VIEW_WIDTH = 100;
const DOT_RADIUS = 4.2;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioAManualThumbProps {
  dots: readonly KkStudioAManualThumbDot[];
  aspect: number;
}

export const KkStudioAManualThumb: FC<KkStudioAManualThumbProps> = ({ dots, aspect }) => {
  const viewHeight = VIEW_WIDTH * aspect;
  const marks = dots.map((dot) => (
    <circle
      key={dot.key}
      data-kind={dot.kind}
      cx={dot.x * VIEW_WIDTH}
      cy={dot.y * viewHeight}
      r={dot.kind === 'own' ? DOT_RADIUS * 1.25 : DOT_RADIUS}
    />
  ));

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
      sx={(theme) => ({
        width: '3.5rem',
        flexShrink: 0,
        alignSelf: 'center',
        borderRadius: '4px',
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 5%, transparent)`,
        borderBottom: `2px solid ${palette(theme).text.primary}`,
        '& circle': { fill: palette(theme).text.secondary },
        '& circle[data-kind="own"]': { fill: palette(theme).primary.main },
        '& circle[data-kind="open"]': {
          fill: 'none',
          stroke: palette(theme).warning.main,
          strokeWidth: 1.6,
          strokeDasharray: '2 1.6',
        },
      })}
    >
      {marks}
    </Box>
  );
};
