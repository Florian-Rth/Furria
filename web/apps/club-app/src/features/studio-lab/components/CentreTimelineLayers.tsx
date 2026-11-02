import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { CentreLayersView } from '../hooks/use-centre-timeline-playground';

interface CentreTimelineLayersProps {
  layers: CentreLayersView;
}

export const CentreTimelineLayers: FC<CentreTimelineLayersProps> = ({ layers }) => {
  const { x, scale, window: strip } = layers.strip;

  return (
    <>
      <KkTouchLab.Strip x={x} scale={scale} left={strip.start} width={strip.width}>
        <KkTouchLab.Bands bands={layers.bands} />
      </KkTouchLab.Strip>
      <KkTouchLab.Half side="before">
        <KkTouchLab.Strip x={x} scale={scale} left={strip.start} width={strip.width}>
          <KkTouchLab.Wave bars={layers.played} />
        </KkTouchLab.Strip>
      </KkTouchLab.Half>
      <KkTouchLab.Half side="after">
        <KkTouchLab.Strip x={x} scale={scale} left={strip.start} width={strip.width}>
          <KkTouchLab.Wave bars={layers.ahead} />
        </KkTouchLab.Strip>
      </KkTouchLab.Half>
      <KkTouchLab.Strip x={x} scale={scale} left={strip.start} width={strip.width}>
        <KkTouchLab.Ticks ticks={layers.ticks} snapX={layers.snapX} />
        {layers.handles.map((handle) => (
          <KkTouchLab.Handle
            key={handle.key}
            x={handle.x}
            kind={handle.kind}
            active={handle.active}
          />
        ))}
      </KkTouchLab.Strip>
      <KkTouchLab.Playhead x={layers.centreX} />
    </>
  );
};
