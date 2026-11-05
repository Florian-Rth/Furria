import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { areaLabelPointOf } from '@/features/hall-plan/area-shape';
import type { AreaElement } from '@/features/hall-plan/schemas';
import { areaLabelOf } from '../hall-builder-view';
import { HallAreaEdgeLengths } from './HallAreaEdgeLengths';

interface HallAreaShapeProps {
  area: AreaElement;
  selected: boolean;
}

export const HallAreaShape: FC<HallAreaShapeProps> = ({ area, selected }) => {
  const label = areaLabelOf(area);
  const lengths = selected ? <HallAreaEdgeLengths area={area} /> : null;
  const outline =
    area.shape === 'polygon' ? (
      <KkFloorPlan.AreaOutline
        id={area.id}
        kind={area.area}
        points={area.points}
        labelAt={areaLabelPointOf(area)}
        label={label}
        selected={selected}
      />
    ) : (
      <KkFloorPlan.Area
        id={area.id}
        kind={area.area}
        x={area.x}
        y={area.y}
        widthCm={area.widthCm}
        heightCm={area.heightCm}
        rotation={area.rotation}
        label={label}
        selected={selected}
      />
    );

  return (
    <>
      {outline}
      {lengths}
    </>
  );
};
