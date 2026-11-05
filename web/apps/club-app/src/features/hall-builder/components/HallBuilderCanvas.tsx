import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { HALL_CANVAS_LABEL } from '../hall-builder-copy';
import { cursorOfTool } from '../hall-builder-tools';
import { HallBuilderOverlay } from './HallBuilderOverlay';
import { HallElementShape } from './HallElementShape';

export const HallBuilderCanvas: FC = () => {
  const builder = useHallBuilderContext();
  const shapes = builder.document.elements.map((element) => (
    <HallElementShape
      key={element.id}
      element={element}
      selected={builder.selection.includes(element.id)}
    />
  ));

  const cursor = cursorOfTool(builder.tool);

  return (
    <KkFloorPlan
      ref={builder.planRef}
      label={HALL_CANVAS_LABEL}
      view={builder.view}
      onViewChange={builder.changeView}
      cursor={cursor}
      touch={builder.isTouch}
      onViewportResize={builder.setViewportSize}
      onPlanPointerDown={builder.down}
      onPlanPointerMove={builder.move}
      onPlanPointerUp={builder.up}
      onPlanPointerCancel={builder.cancel}
      onPlanDoubleClick={builder.doubleClick}
    >
      {shapes}
      <HallBuilderOverlay />
    </KkFloorPlan>
  );
};
