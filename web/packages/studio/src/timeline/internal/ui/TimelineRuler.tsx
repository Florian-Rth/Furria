import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { rulerTicksOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export const TimelineRuler: FC = () => {
  const { length, centre } = useTimeline();
  const ticks = rulerTicksOf(length, centre?.pxPerSecond ?? 0);

  return (
    <TimelineStrip>
      <KkTimeline.Ruler ticks={ticks} />
    </TimelineStrip>
  );
};
