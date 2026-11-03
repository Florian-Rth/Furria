import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { CountMark } from '../../../models/music-timeline';
import { countSharesOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

interface TimelineCountsProps {
  marks: readonly CountMark[];
}

export const TimelineCounts: FC<TimelineCountsProps> = ({ marks }) => {
  const { length } = useTimeline();

  const shares = countSharesOf(marks, length);

  return (
    <TimelineStrip>
      <KkTimeline.Counts shares={shares} />
    </TimelineStrip>
  );
};
