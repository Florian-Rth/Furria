import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import type { PlannerScene } from '../planner-scene';

interface TablePlannerSceneLayerProps {
  scene: PlannerScene;
}

export const TablePlannerSceneLayer: FC<TablePlannerSceneLayerProps> = ({ scene }) => {
  const zones = scene.zones.map((zone) => (
    <KkFloorPlan.ChairZone
      key={zone.key}
      id={zone.rowId}
      shape={zone.shape}
      x={zone.x}
      y={zone.y}
      lengthCm={zone.lengthCm}
      widthCm={zone.widthCm}
      rotation={zone.rotation}
      depthCm={zone.depthCm}
      sides={zone.sides}
      conflict={zone.conflict}
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
      selected={chair.selected}
    />
  ));
  const notes = scene.notes.map((note) => (
    <KkFloorPlan.NoteMark key={note.key} x={note.at.x} y={note.at.y} />
  ));

  return (
    <>
      {zones}
      {tables}
      {chairs}
      {notes}
    </>
  );
};
