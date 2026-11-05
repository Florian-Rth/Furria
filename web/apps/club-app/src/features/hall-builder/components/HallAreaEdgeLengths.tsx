import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { areaEdgesOf } from '@/features/hall-plan/area-shape';
import { formatDistance } from '@/features/hall-plan/plan-measure';
import type { AreaElement } from '@/features/hall-plan/schemas';

interface HallAreaEdgeLengthsProps {
  area: AreaElement;
}

export const HallAreaEdgeLengths: FC<HallAreaEdgeLengthsProps> = ({ area }) => {
  const lengths = areaEdgesOf(area).map((edge) => (
    <KkFloorPlan.EdgeLength
      key={`${edge.from.x}:${edge.from.y}:${edge.to.x}:${edge.to.y}`}
      from={edge.from}
      to={edge.to}
      outward={edge.outward}
      label={formatDistance(edge.lengthCm)}
    />
  ));

  return <>{lengths}</>;
};
