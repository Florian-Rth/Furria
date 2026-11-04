import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  planPalette,
  pointsAttribute,
  STROKE,
} from '../floor-plan-paint';

interface KkFloorPlanWallProps {
  id?: string;
  points: readonly KkPlanPoint[];
  thicknessCm: number;
  selected?: boolean;
  muted?: boolean;
}

export const KkFloorPlanWall: FC<KkFloorPlanWallProps> = ({
  id,
  points,
  thicknessCm,
  selected = false,
  muted = false,
}) => {
  const line = pointsAttribute(points);
  const outline = selected ? (
    <Box
      component="polyline"
      points={line}
      vectorEffect={NON_SCALING}
      sx={(theme) => ({ stroke: planPalette(theme).primary.main, strokeWidth: STROKE.section })}
    />
  ) : null;

  return (
    <Box
      component="g"
      {...hitAttributes(id, muted)}
      data-kk-plan-wall
      sx={[{ fill: 'none', strokeLinecap: 'square', strokeLinejoin: 'miter' }, mutedPaint(muted)]}
    >
      <Box
        component="polyline"
        points={line}
        strokeWidth={thicknessCm}
        sx={(theme) => ({ stroke: planPalette(theme).text.primary })}
      />
      {outline}
    </Box>
  );
};
