import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { formatDistance, measure } from '@/features/hall-plan/plan-measure';
import { useTablePlannerContext } from '../table-planner-context';
import { toFindingMarkLabel } from '../table-planner-copy';
import { TablePlannerDrawReadout } from './TablePlannerDrawReadout';
import { TablePlannerSceneLayer } from './TablePlannerSceneLayer';

export const TablePlannerOverlay: FC = () => {
  const planner = useTablePlannerContext();
  const { overlay } = planner.pointer;
  const findings = planner.scene.findings.map((finding) => (
    <KkFloorPlan.Finding
      key={finding.key}
      id={finding.key}
      severity={finding.severity}
      from={finding.from}
      to={finding.to}
      label={toFindingMarkLabel(finding.kind, finding.distanceCm)}
      selected={finding.selected}
    />
  ));
  const frame = planner.scene.frame;
  const selection =
    frame === null ? null : (
      <KkFloorPlan.Selection
        x={frame.x}
        y={frame.y}
        widthCm={frame.widthCm}
        heightCm={frame.heightCm}
        rotation={frame.rotation}
        rotatable={planner.tool === 'select'}
      />
    );
  const guides = overlay.guides.map((guide) => {
    const from =
      guide.axis === 'x' ? { x: guide.at, y: guide.from } : { x: guide.from, y: guide.at };
    const to = guide.axis === 'x' ? { x: guide.at, y: guide.to } : { x: guide.to, y: guide.at };

    return <KkFloorPlan.Guide key={`${guide.axis}:${guide.at}:${guide.from}:${guide.to}`} from={from} to={to} />;
  });
  const marquee =
    overlay.marquee === null ? null : (
      <KkFloorPlan.Marquee from={overlay.marquee.from} to={overlay.marquee.to} />
    );
  const ruler = overlay.measure === null ? null : measure(overlay.measure.from, overlay.measure.to);
  const measureMark =
    ruler === null ? null : (
      <KkFloorPlan.Measure
        from={ruler.from}
        to={ruler.to}
        label={formatDistance(ruler.distanceCm)}
      />
    );
  const ghost =
    planner.ghostScene === null ? null : (
      <KkFloorPlan.Ghost>
        <TablePlannerSceneLayer scene={planner.ghostScene} />
      </KkFloorPlan.Ghost>
    );
  const readout = overlay.draw === null ? null : <TablePlannerDrawReadout />;
  const loupe =
    planner.loupe === null ? null : <KkFloorPlan.Loupe x={planner.loupe.x} y={planner.loupe.y} />;

  return (
    <>
      {findings}
      {selection}
      {guides}
      {ghost}
      {readout}
      {marquee}
      {measureMark}
      {loupe}
    </>
  );
};
