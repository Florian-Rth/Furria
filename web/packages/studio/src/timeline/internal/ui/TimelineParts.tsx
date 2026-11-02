import type { KkGroupTone } from '@furria/ui/group-tone';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { spanSharesOf } from '../../timeline-geometry';
import { useTimeline } from '../logic/timeline-context';

export interface TimelinePart {
  key: number;
  label: string;
  hint?: string;
  range: TimelineRange | null;
  shade: number;
}

interface TimelinePartsProps {
  parts: readonly TimelinePart[];
  tone: KkGroupTone | null;
  onSelect?: (key: number) => void;
}

export const TimelineParts: FC<TimelinePartsProps> = ({ parts, tone, onSelect }) => {
  const { length } = useTimeline();
  const bands = spanSharesOf(parts, length);

  return <KkTimeline.Parts tone={tone} parts={bands} onSelect={onSelect} />;
};
