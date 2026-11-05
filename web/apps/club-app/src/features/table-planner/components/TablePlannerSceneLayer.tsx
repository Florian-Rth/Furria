import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import type { PlannerScene } from '../planner-scene';

interface TablePlannerSceneLayerProps {
  scene: PlannerScene;
}

export const TablePlannerSceneLayer: FC<TablePlannerSceneLayerProps> = ({ scene }) => {
  const cells = scene.cells.map((cell) => (
    <KkFloorPlan.ChairCell
      key={cell.key}
      id={cell.id}
      x={cell.x}
      y={cell.y}
      rotation={cell.rotation}
      widthCm={cell.widthCm}
      depthCm={cell.depthCm}
      conflict={cell.conflict}
      faded={cell.faded}
    />
  ));
  const tables = scene.tables.map((table) => (
    <KkFloorPlan.Table
      key={table.key}
      id={table.rowId}
      shape={table.shape}
      x={table.x}
      y={table.y}
      lengthCm={table.lengthCm}
      widthCm={table.widthCm}
      rotation={table.rotation}
      segments={table.segments}
      number={table.number}
      selected={table.selected}
      conflict={table.conflict}
    />
  ));
  const chairs = scene.chairs.map((chair) => (
    <KkFloorPlan.Chair
      key={chair.id}
      id={chair.id}
      x={chair.x}
      y={chair.y}
      rotation={chair.rotation}
      widthCm={chair.widthCm}
      depthCm={chair.depthCm}
      number={chair.number}
      hasNote={chair.hasNote}
      removed={chair.removed}
      faded={chair.faded}
      conflict={chair.conflict}
      selected={chair.selected}
    />
  ));
  const notes = scene.notes.map((note) => (
    <KkFloorPlan.NoteMark key={note.key} x={note.at.x} y={note.at.y} />
  ));

  return (
    <>
      {cells}
      {tables}
      {chairs}
      {notes}
    </>
  );
};
