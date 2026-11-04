import type { KkPlanCursor } from '@furria/ui/KkFloorPlan';
import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import type { PlannerTool } from '../planner-tools';
import { useTablePlannerContext } from '../table-planner-context';
import { CANVAS_LABEL } from '../table-planner-copy';
import { TablePlannerHallElement } from './TablePlannerHallElement';
import { TablePlannerOverlay } from './TablePlannerOverlay';
import { TablePlannerSceneLayer } from './TablePlannerSceneLayer';

const CURSORS: Record<PlannerTool, KkPlanCursor> = {
  select: 'default',
  table: 'copy',
  row: 'crosshair',
  measure: 'crosshair',
};

export const TablePlannerCanvas: FC = () => {
  const planner = useTablePlannerContext();
  const exitClearance = planner.standard.exitClearanceCm;
  const hall = planner.plan.hall.document.elements.map((element) => (
    <TablePlannerHallElement key={element.id} element={element} exitClearanceCm={exitClearance} />
  ));

  return (
    <KkFloorPlan
      ref={planner.viewport.ref}
      label={CANVAS_LABEL}
      view={planner.viewport.view}
      onViewChange={planner.viewport.setView}
      cursor={CURSORS[planner.tool]}
      onPlanPointerDown={planner.pointer.down}
      onPlanPointerMove={planner.pointer.move}
      onPlanPointerUp={planner.pointer.up}
      onPlanPointerCancel={planner.pointer.cancel}
      onPlanDoubleClick={planner.pointer.doubleClick}
    >
      {hall}
      <TablePlannerSceneLayer scene={planner.scene} />
      <TablePlannerOverlay />
    </KkFloorPlan>
  );
};
