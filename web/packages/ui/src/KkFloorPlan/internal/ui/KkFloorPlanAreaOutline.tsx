import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import type { KkPlanAreaKind } from '../floor-plan-paint';
import {
  areaInk,
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  planPalette,
  planTint,
  pointsAttribute,
  STROKE,
} from '../floor-plan-paint';
import { KkFloorPlanScreenText } from './KkFloorPlanScreenText';

interface KkFloorPlanAreaOutlineProps {
  id?: string;
  kind: KkPlanAreaKind;
  points: readonly KkPlanPoint[];
  labelAt: KkPlanPoint;
  label: string;
  selected?: boolean;
  muted?: boolean;
}

export const KkFloorPlanAreaOutline: FC<KkFloorPlanAreaOutlineProps> = ({
  id,
  kind,
  points,
  labelAt,
  label,
  selected = false,
  muted = false,
}) => (
  <Box component="g" {...hitAttributes(id, muted)} data-kk-plan-area={kind} sx={mutedPaint(muted)}>
    <Box
      component="polygon"
      points={pointsAttribute(points)}
      vectorEffect={NON_SCALING}
      sx={(theme) => ({
        fill: planTint(areaInk(theme, kind), '16%'),
        stroke: selected ? planPalette(theme).primary.main : areaInk(theme, kind),
        strokeWidth: selected ? STROKE.page : STROKE.section,
        strokeLinejoin: 'round',
      })}
    />
    <KkFloorPlanScreenText x={labelAt.x} y={labelAt.y} text={label} emphasis />
  </Box>
);
