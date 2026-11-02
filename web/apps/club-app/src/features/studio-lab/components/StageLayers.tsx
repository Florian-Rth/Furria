import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { StageLayersView } from '../hooks/use-stage-playground';

interface StageLayersProps {
  layers: StageLayersView;
}

export const StageLayers: FC<StageLayersProps> = ({ layers }) => {
  const bend =
    layers.bend === null ? null : (
      <KkTouchLab.Bend x={layers.bend.x} y={layers.bend.y} active={layers.bend.active} />
    );

  return (
    <>
      <KkTouchLab.Floor
        floor={layers.floor}
        columns={layers.columns}
        rows={layers.rows}
        snapX={layers.snapX}
        snapY={layers.snapY}
      />
      <KkTouchLab.Paths paths={layers.paths} />
      {bend}
      {layers.dots.map((dot) => (
        <KkTouchLab.Dot
          key={dot.spotId}
          x={dot.x}
          y={dot.y}
          number={dot.number}
          state={dot.state}
          open={dot.open}
        />
      ))}
    </>
  );
};
