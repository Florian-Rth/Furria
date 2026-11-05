import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  placeAt,
  planPalette,
  planTint,
  STROKE,
} from '../floor-plan-paint';

interface KkFloorPlanChairCellProps {
  id?: string;
  x: number;
  y: number;
  rotation: number;
  widthCm: number;
  depthCm: number;
  conflict?: boolean;
  faded?: boolean;
  muted?: boolean;
}

const cellPaint = (theme: Theme, conflict: boolean, faded: boolean) => {
  if (faded) {
    return {
      fill: 'transparent',
      stroke: planTint(planPalette(theme).info.main, '45%'),
      strokeWidth: STROKE.hair,
      strokeDasharray: '3 3',
    };
  }

  return {
    fill: conflict
      ? planTint(planPalette(theme).primary.main, '26%')
      : planTint(planPalette(theme).info.main, '16%'),
    stroke: 'none',
  };
};

export const KkFloorPlanChairCell: FC<KkFloorPlanChairCellProps> = ({
  id,
  x,
  y,
  rotation,
  widthCm,
  depthCm,
  conflict = false,
  faded = false,
  muted = false,
}) => (
  <Box
    component="g"
    transform={placeAt(x, y, rotation)}
    {...hitAttributes(id, muted)}
    data-kk-plan-chair-cell={faded ? 'faded' : 'seated'}
    sx={mutedPaint(muted)}
  >
    <Box
      component="rect"
      x={-widthCm / 2}
      y={-depthCm / 2}
      width={widthCm}
      height={depthCm}
      vectorEffect={NON_SCALING}
      sx={(theme) => cellPaint(theme, conflict, faded)}
    />
  </Box>
);
