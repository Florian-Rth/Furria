import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import type { KkStudioBDot, KkStudioBDotRole } from './studio-b-dot';

const CAST_RADIUS = 0.42;
const OWN_RADIUS = 0.62;
const FRAME_STROKE = 0.12;
const FRONT_STROKE = 0.36;
const OPEN_STROKE = 0.14;
const OPEN_DASH = '0.22 0.16';

interface CircleShape {
  r: number;
  strokeWidth: number;
  strokeDasharray?: string;
}

const CIRCLE_SHAPES: Record<KkStudioBDotRole, CircleShape> = {
  own: { r: OWN_RADIUS, strokeWidth: 0 },
  cast: { r: CAST_RADIUS, strokeWidth: 0 },
  open: { r: CAST_RADIUS, strokeWidth: OPEN_STROKE, strokeDasharray: OPEN_DASH },
};

const formationPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    display: 'block',
    flexShrink: 0,
    width: '2.75rem',
    height: 'auto',
    '& [data-part="frame"]': { fill: palette.background.default, stroke: palette.divider },
    '& [data-part="front"]': { stroke: palette.text.primary },
    '& [data-role="cast"]': { fill: palette.text.secondary },
    '& [data-role="open"]': { fill: 'none', stroke: palette.warning.main },
    '& [data-role="own"]': { fill: palette.primary.main },
  };
};

interface KkStudioBFormationProps {
  widthMetres: number;
  depthMetres: number;
  dots: readonly KkStudioBDot[];
  sx?: KkSx;
}

export const KkStudioBFormation: FC<KkStudioBFormationProps> = ({
  widthMetres,
  depthMetres,
  dots,
  sx,
}) => {
  const circles = dots.map((dot) => (
    <circle
      key={dot.spotId}
      data-role={dot.role}
      cx={dot.x * widthMetres}
      cy={dot.y * depthMetres}
      {...CIRCLE_SHAPES[dot.role]}
    />
  ));

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${widthMetres} ${depthMetres}`}
      data-kk-studio-b-formation
      sx={[formationPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <rect
        data-part="frame"
        x={0}
        y={0}
        width={widthMetres}
        height={depthMetres}
        strokeWidth={FRAME_STROKE}
      />
      <line
        data-part="front"
        x1={0}
        y1={depthMetres}
        x2={widthMetres}
        y2={depthMetres}
        strokeWidth={FRONT_STROKE}
      />
      {circles}
    </Box>
  );
};
