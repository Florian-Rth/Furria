import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { isRuled, rulerTicksOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export const TimelineRuler: FC = () => {
  const { length, density, window, centre } = useTimeline();

  if (!isRuled(density)) {
    return null;
  }

  const spacing = centre === null ? window : { start: 0, end: centre.visibleShare };
  const ticks = rulerTicksOf(length, spacing);

  return (
    <TimelineStrip>
      <KkTimeline.Ruler ticks={ticks} />
    </TimelineStrip>
  );
};
