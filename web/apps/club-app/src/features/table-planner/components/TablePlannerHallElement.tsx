import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { areaLabelOf } from '@/features/hall-builder/hall-builder-view';
import { areaLabelPointOf } from '@/features/hall-plan/area-shape';
import type { HallElement } from '@/features/hall-plan/schemas';

interface TablePlannerHallElementProps {
  element: HallElement;
  exitClearanceCm: number;
}

export const TablePlannerHallElement: FC<TablePlannerHallElementProps> = ({
  element,
  exitClearanceCm,
}) => {
  switch (element.kind) {
    case 'wall':
      return <KkFloorPlan.Wall points={element.points} thicknessCm={element.thicknessCm} muted />;
    case 'door': {
      const clearance = element.door === 'emergencyExit' ? exitClearanceCm : undefined;

      return (
        <KkFloorPlan.Door
          from={element.from}
          to={element.to}
          kind={element.door}
          clearanceCm={clearance}
          muted
        />
      );
    }
    case 'area':
      return element.shape === 'polygon' ? (
        <KkFloorPlan.AreaOutline
          kind={element.area}
          points={element.points}
          labelAt={areaLabelPointOf(element)}
          label={areaLabelOf(element)}
          muted
        />
      ) : (
        <KkFloorPlan.Area
          kind={element.area}
          x={element.x}
          y={element.y}
          widthCm={element.widthCm}
          heightCm={element.heightCm}
          rotation={element.rotation}
          label={areaLabelOf(element)}
          muted
        />
      );
    case 'pillar':
      return (
        <KkFloorPlan.Pillar
          x={element.x}
          y={element.y}
          widthCm={element.widthCm}
          heightCm={element.heightCm}
          round={element.round}
          muted
        />
      );
    case 'line':
      return <KkFloorPlan.MarkLine points={element.points} label={element.label} muted />;
    case 'text':
      return (
        <KkFloorPlan.Label
          x={element.x}
          y={element.y}
          text={element.text}
          size={element.size}
          rotation={element.rotation}
          muted
        />
      );
  }
};
