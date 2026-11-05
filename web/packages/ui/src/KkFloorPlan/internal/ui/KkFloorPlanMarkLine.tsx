import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planMidpoint } from '../../floor-plan-view';
import {
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  planPalette,
  pointsAttribute,
  STROKE,
} from '../floor-plan-paint';
import { KkFloorPlanScreenText } from './KkFloorPlanScreenText';

interface KkFloorPlanMarkLineProps {
  id?: string;
  points: readonly KkPlanPoint[];
  label: string | null;
  selected?: boolean;
  muted?: boolean;
}

const HIT_WIDTH_PX = 14;

export const KkFloorPlanMarkLine: FC<KkFloorPlanMarkLineProps> = ({
  id,
  points,
  label,
  selected = false,
  muted = false,
}) => {
  const line = pointsAttribute(points);
  const [first, second] = points;
  const caption =
    label !== null && first !== undefined && second !== undefined ? (
      <KkFloorPlanScreenText {...planMidpoint(first, second)} text={label} quiet />
    ) : null;

  return (
    <Box
      component="g"
      {...hitAttributes(id, muted)}
      data-kk-plan-mark-line
      sx={[{ fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }, mutedPaint(muted)]}
    >
      <Box
        component="polyline"
        points={line}
        vectorEffect={NON_SCALING}
        sx={{ stroke: 'transparent', strokeWidth: HIT_WIDTH_PX }}
      />
      <Box
        component="polyline"
        points={line}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({
          stroke: selected ? planPalette(theme).primary.main : planPalette(theme).text.secondary,
          strokeWidth: selected ? STROKE.page : STROKE.section,
          strokeDasharray: '8 6',
        })}
      />
      {caption}
    </Box>
  );
};
