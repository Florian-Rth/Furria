import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  planPalette,
  planTint,
  STROKE,
} from '../floor-plan-paint';

interface KkFloorPlanPillarProps {
  id?: string;
  x: number;
  y: number;
  widthCm: number;
  heightCm: number;
  round: boolean;
  selected?: boolean;
  muted?: boolean;
}

export const KkFloorPlanPillar: FC<KkFloorPlanPillarProps> = ({
  id,
  x,
  y,
  widthCm,
  heightCm,
  round,
  selected = false,
  muted = false,
}) => {
  const paint = {
    vectorEffect: NON_SCALING,
    sx: (theme: Theme) => ({
      fill: planTint(planPalette(theme).text.primary, '70%'),
      stroke: selected ? planPalette(theme).primary.main : planPalette(theme).text.primary,
      strokeWidth: selected ? STROKE.page : STROKE.hair,
    }),
  };
  const body = round ? (
    <Box component="ellipse" cx={x} cy={y} rx={widthCm / 2} ry={heightCm / 2} {...paint} />
  ) : (
    <Box
      component="rect"
      x={x - widthCm / 2}
      y={y - heightCm / 2}
      width={widthCm}
      height={heightCm}
      {...paint}
    />
  );

  return (
    <Box component="g" {...hitAttributes(id, muted)} data-kk-plan-pillar sx={mutedPaint(muted)}>
      {body}
    </Box>
  );
};
