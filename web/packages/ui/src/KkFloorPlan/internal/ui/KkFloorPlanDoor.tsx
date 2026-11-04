import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planDistance } from '../../floor-plan-view';
import type { KkPlanDoorKind } from '../floor-plan-paint';
import {
  doorInk,
  hitAttributes,
  mutedPaint,
  NON_SCALING,
  planPalette,
  planTint,
  STROKE,
} from '../floor-plan-paint';

interface KkFloorPlanDoorProps {
  id?: string;
  from: KkPlanPoint;
  to: KkPlanPoint;
  kind: KkPlanDoorKind;
  wallThicknessCm?: number;
  clearanceCm?: number;
  selected?: boolean;
  muted?: boolean;
}

const DEFAULT_WALL_CM = 24;
const DEGREES = 180 / Math.PI;

export const KkFloorPlanDoor: FC<KkFloorPlanDoorProps> = ({
  id,
  from,
  to,
  kind,
  wallThicknessCm = DEFAULT_WALL_CM,
  clearanceCm = 0,
  selected = false,
  muted = false,
}) => {
  const width = planDistance(from, to);
  const angle = Math.atan2(to.y - from.y, to.x - from.x) * DEGREES;
  const transform = `translate(${from.x} ${from.y}) rotate(${angle})`;
  const swing = `M${width} 0A${width} ${width} 0 0 0 0 ${-width}`;
  const keepClear =
    clearanceCm > 0 ? (
      <Box
        component="rect"
        x={0}
        y={-clearanceCm}
        width={width}
        height={clearanceCm * 2}
        vectorEffect={NON_SCALING}
        sx={(theme) => ({
          fill: planTint(doorInk(theme, kind), '10%'),
          stroke: planTint(doorInk(theme, kind), '45%'),
          strokeWidth: STROKE.hair,
          strokeDasharray: '4 4',
        })}
      />
    ) : null;

  return (
    <Box
      component="g"
      transform={transform}
      {...hitAttributes(id, muted)}
      data-kk-plan-door
      sx={[{ fill: 'none' }, mutedPaint(muted)]}
    >
      {keepClear}
      <Box
        component="line"
        x1={0}
        y1={0}
        x2={width}
        y2={0}
        strokeWidth={wallThicknessCm + 2}
        sx={(theme) => ({ stroke: planPalette(theme).background.default })}
      />
      <Box
        component="g"
        sx={(theme) => ({
          stroke: selected ? planPalette(theme).primary.main : doorInk(theme, kind),
          strokeWidth: selected ? STROKE.page : STROKE.section,
        })}
      >
        <line x1={0} y1={0} x2={0} y2={-width} vectorEffect={NON_SCALING} />
        <path d={swing} vectorEffect={NON_SCALING} strokeDasharray="3 3" />
        <line x1={0} y1={0} x2={width} y2={0} vectorEffect={NON_SCALING} />
      </Box>
    </Box>
  );
};
