import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { spanSharesOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelinePart {
  key: number;
  label: string;
  hint?: string;
  range: TimelineRange | null;
  shade: number;
  current?: boolean;
  selected?: boolean;
}

interface TimelinePartsProps {
  parts: readonly TimelinePart[];
  tone: KkGroupTone | null;
  lane?: string;
  onSelect?: (key: number) => void;
}

export const TimelineParts: FC<TimelinePartsProps> = ({ parts, tone, lane, onSelect }) => {
  const { length, centre } = useTimeline();
  const bands = spanSharesOf(parts, length);
  const pan = centre === null ? null : { x: centre.x, width: centre.contentWidth };

  return (
    <TimelineStrip>
      <KkTimeline.Parts tone={tone} parts={bands} lane={lane} pan={pan} onSelect={onSelect} />
    </TimelineStrip>
  );
};
