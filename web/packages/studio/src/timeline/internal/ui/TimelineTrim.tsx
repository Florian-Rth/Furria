import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

interface TimelineTrimProps {
  range: TimelineRange | null;
}

export const TimelineTrim: FC<TimelineTrimProps> = ({ range }) => {
  const { length } = useTimeline();

  if (range === null) {
    return null;
  }

  return (
    <TimelineStrip>
      <KkTimeline.Trim from={shareOf(range.start, length)} to={shareOf(range.end, length)} />
    </TimelineStrip>
  );
};
