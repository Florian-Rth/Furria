import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planDistance, planMidpoint } from '../../floor-plan-view';
import type { KkPlanSeverity } from '../floor-plan-paint';
import {
  hitAttributes,
  NON_SCALING,
  STROKE,
  screenConstantAt,
  severityInk,
} from '../floor-plan-paint';
import { useFloorPlanScale } from '../logic/floor-plan-context';
import { KkFloorPlanChip } from './KkFloorPlanChip';

interface KkFloorPlanFindingProps {
  id?: string;
  severity: KkPlanSeverity;
  from: KkPlanPoint;
  to: KkPlanPoint;
  label: string;
  selected?: boolean;
}

const RING_PX = 11;
const TOUCHING_CM = 0.5;

export const KkFloorPlanFinding: FC<KkFloorPlanFindingProps> = ({
  id,
  severity,
  from,
  to,
  label,
  selected = false,
}) => {
  const scale = useFloorPlanScale();
  const middle = planMidpoint(from, to);
  const isPoint = planDistance(from, to) < TOUCHING_CM;
  const ink = { sx: { stroke: 'currentColor' } };
  const mark = isPoint ? (
    <Box
      component="circle"
      transform={screenConstantAt(middle.x, middle.y, scale)}
      cx={0}
      cy={0}
      r={RING_PX}
      strokeWidth={selected ? STROKE.page * 1.5 : STROKE.page}
      {...ink}
    />
  ) : (
    <Box
      component="line"
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      vectorEffect={NON_SCALING}
      strokeWidth={selected ? STROKE.page * 1.5 : STROKE.page}
      strokeDasharray={severity === 'hint' ? '5 4' : 'none'}
      {...ink}
    />
  );
  const chipAt = isPoint ? { x: middle.x, y: middle.y - (RING_PX * 2.2) / scale } : middle;

  return (
    <Box
      component="g"
      {...hitAttributes(id, false)}
      data-kk-plan-finding={severity}
      sx={(theme) => ({ color: severityInk(theme, severity), fill: 'none' })}
    >
      {mark}
      <KkFloorPlanChip x={chipAt.x} y={chipAt.y} label={label} tone={severity} />
    </Box>
  );
};
