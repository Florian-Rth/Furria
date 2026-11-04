import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import type { HallElement } from '@/features/hall-plan/schemas';
import { areaLabelOf } from '../hall-builder-view';

interface HallElementShapeProps {
  element: HallElement;
  selected: boolean;
}

export const HallElementShape: FC<HallElementShapeProps> = ({ element, selected }) => {
  switch (element.kind) {
    case 'wall':
      return (
        <KkFloorPlan.Wall
          id={element.id}
          points={element.points}
          thicknessCm={element.thicknessCm}
          selected={selected}
        />
      );
    case 'door':
      return (
        <KkFloorPlan.Door
          id={element.id}
          from={element.from}
          to={element.to}
          kind={element.door}
          selected={selected}
        />
      );
    case 'area':
      return (
        <KkFloorPlan.Area
          id={element.id}
          kind={element.area}
          x={element.x}
          y={element.y}
          widthCm={element.widthCm}
          heightCm={element.heightCm}
          rotation={element.rotation}
          label={areaLabelOf(element)}
          selected={selected}
        />
      );
    case 'pillar':
      return (
        <KkFloorPlan.Pillar
          id={element.id}
          x={element.x}
          y={element.y}
          widthCm={element.widthCm}
          heightCm={element.heightCm}
          round={element.round}
          selected={selected}
        />
      );
    case 'line':
      return (
        <KkFloorPlan.MarkLine
          id={element.id}
          points={element.points}
          label={element.label}
          selected={selected}
        />
      );
    case 'text':
      return (
        <KkFloorPlan.Label
          id={element.id}
          x={element.x}
          y={element.y}
          text={element.text}
          size={element.size}
          rotation={element.rotation}
          selected={selected}
        />
      );
  }
};
