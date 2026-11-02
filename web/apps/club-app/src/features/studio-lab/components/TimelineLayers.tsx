import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { TimelineLayersView } from '../hooks/use-timeline-playground';

interface TimelineLayersProps {
  layers: TimelineLayersView;
}

export const TimelineLayers: FC<TimelineLayersProps> = ({ layers }) => (
  <>
    <KkTouchLab.Bands bands={layers.bands} />
    <KkTouchLab.Wave bars={layers.bars} />
    <KkTouchLab.Ticks ticks={layers.ticks} snapX={layers.snapX} />
    {layers.handles.map((handle) => (
      <KkTouchLab.Handle key={handle.key} x={handle.x} kind={handle.kind} active={handle.active} />
    ))}
    <KkTouchLab.Playhead x={layers.playheadX} />
  </>
);
