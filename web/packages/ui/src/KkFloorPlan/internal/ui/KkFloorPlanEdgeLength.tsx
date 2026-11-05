import type { FC } from 'react';
import type { KkPlanPoint } from '../../floor-plan-view';
import { planMidpoint } from '../../floor-plan-view';
import { useFloorPlanScale } from '../logic/floor-plan-context';
import { KkFloorPlanChip } from './KkFloorPlanChip';

interface KkFloorPlanEdgeLengthProps {
  from: KkPlanPoint;
  to: KkPlanPoint;
  outward: KkPlanPoint;
  label: string;
}

const OFFSET_PX = 16;

export const KkFloorPlanEdgeLength: FC<KkFloorPlanEdgeLengthProps> = ({
  from,
  to,
  outward,
  label,
}) => {
  const scale = useFloorPlanScale();
  const middle = planMidpoint(from, to);
  const reach = OFFSET_PX / scale;

  return (
    <KkFloorPlanChip
      x={middle.x + outward.x * reach}
      y={middle.y + outward.y * reach}
      label={label}
      tone="ink"
    />
  );
};
