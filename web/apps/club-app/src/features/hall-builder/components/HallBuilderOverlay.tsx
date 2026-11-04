import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { areaLabelOf } from '../hall-builder-view';
import { HallPolylineGhost } from './HallPolylineGhost';

export const HallBuilderOverlay: FC = () => {
  const { overlay } = useHallBuilderContext();
  const { frame, polyline, door, area, measure, marquee } = overlay;
  const guides = overlay.guides.map((guide) => (
    <KkFloorPlan.Guide key={guide.key} from={guide.from} to={guide.to} />
  ));
  const vertices = overlay.vertices.map((vertex) => (
    <KkFloorPlan.Handle key={vertex.id} id={vertex.id} x={vertex.x} y={vertex.y} shape="round" />
  ));
  const selection =
    frame === null ? null : (
      <KkFloorPlan.Selection
        x={frame.x}
        y={frame.y}
        widthCm={frame.widthCm}
        heightCm={frame.heightCm}
        rotation={frame.rotation}
        resizable={frame.resizable}
        rotatable={frame.rotatable}
      />
    );
  const polylineGhost = polyline === null ? null : <HallPolylineGhost polyline={polyline} />;
  const doorGhost =
    door === null ? null : (
      <KkFloorPlan.Ghost>
        <KkFloorPlan.Door from={door.from} to={door.to} kind="entrance" />
      </KkFloorPlan.Ghost>
    );
  const areaGhost =
    area === null ? null : (
      <KkFloorPlan.Ghost>
        <KkFloorPlan.Area
          kind={area.area}
          x={area.x}
          y={area.y}
          widthCm={area.widthCm}
          heightCm={area.heightCm}
          rotation={area.rotation}
          label={areaLabelOf(area)}
        />
      </KkFloorPlan.Ghost>
    );
  const measureLine =
    measure === null ? null : (
      <KkFloorPlan.Measure from={measure.from} to={measure.to} label={measure.label} />
    );
  const marqueeBox =
    marquee === null ? null : <KkFloorPlan.Marquee from={marquee.from} to={marquee.to} />;

  return (
    <>
      {guides}
      {polylineGhost}
      {doorGhost}
      {areaGhost}
      {selection}
      {vertices}
      {measureLine}
      {marqueeBox}
    </>
  );
};
