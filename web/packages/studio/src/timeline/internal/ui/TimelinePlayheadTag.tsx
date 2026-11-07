import type { FC } from 'react';
import { useTimeline } from '../logic/timeline-context';
import { TimelinePlayheadTime } from './TimelinePlayheadTime';

interface TimelinePlayheadTagProps {
  name: string | null;
}

export const TimelinePlayheadTag: FC<TimelinePlayheadTagProps> = ({ name }) => {
  const { length, centre } = useTimeline();

  if (centre === null) {
    return null;
  }

  return <TimelinePlayheadTime centre={centre} length={length} name={name} />;
};
