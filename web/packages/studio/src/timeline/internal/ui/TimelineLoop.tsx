import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { loopSharesOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

interface TimelineLoopProps {
  range: TimelineRange | null;
}

export const TimelineLoop: FC<TimelineLoopProps> = ({ range }) => {
  const { length } = useTimeline();

  const loop = loopSharesOf(range, length);

  return <KkTimeline.Loop range={loop} />;
};
