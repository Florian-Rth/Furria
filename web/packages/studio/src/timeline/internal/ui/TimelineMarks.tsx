import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineMark {
  key: string;
  seconds: number;
  strong: boolean;
  text: string | null;
}

interface TimelineMarksProps {
  marks: readonly TimelineMark[];
  edge: 'top' | 'bottom';
}

export const TimelineMarks: FC<TimelineMarksProps> = ({ marks, edge }) => {
  const { length } = useTimeline();
  const ticks = marks.map((mark) => ({
    key: mark.key,
    share: shareOf(mark.seconds, length),
    strong: mark.strong,
    text: mark.text,
  }));

  return (
    <TimelineStrip>
      <KkTimeline.Marks ticks={ticks} edge={edge} />
    </TimelineStrip>
  );
};
