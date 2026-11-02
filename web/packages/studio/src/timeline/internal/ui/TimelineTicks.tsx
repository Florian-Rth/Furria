import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineSpan } from '../../timeline-geometry';
import { spanSharesOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

interface TimelineTicksProps {
  steps: readonly TimelineSpan[];
  activeKey: number | null;
  revealSeconds?: number | null;
}

export const TimelineTicks: FC<TimelineTicksProps> = ({
  steps,
  activeKey,
  revealSeconds = null,
}) => {
  const { length } = useTimeline();
  const ticks = spanSharesOf(steps, length);

  return (
    <TimelineStrip>
      <KkTimeline.Ticks ticks={ticks} activeKey={activeKey} revealSeconds={revealSeconds} />
    </TimelineStrip>
  );
};
