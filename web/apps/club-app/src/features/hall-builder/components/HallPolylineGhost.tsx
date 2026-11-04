import { KkFloorPlan } from '@furria/ui/KkFloorPlan';
import type { FC } from 'react';
import { DEFAULT_WALL_THICKNESS_CM } from '@/features/hall-plan/hall-ops';
import type { OverlayPolyline } from '../hall-overlay';

interface HallPolylineGhostProps {
  polyline: OverlayPolyline;
}

export const HallPolylineGhost: FC<HallPolylineGhostProps> = ({ polyline }) => {
  const shape =
    polyline.tool === 'wall' ? (
      <KkFloorPlan.Wall points={polyline.points} thicknessCm={DEFAULT_WALL_THICKNESS_CM} />
    ) : (
      <KkFloorPlan.MarkLine points={polyline.points} label={null} />
    );

  return <KkFloorPlan.Ghost>{shape}</KkFloorPlan.Ghost>;
};
