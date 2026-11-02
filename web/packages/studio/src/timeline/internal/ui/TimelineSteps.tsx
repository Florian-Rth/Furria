import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import { spanSharesOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineStep {
  key: number;
  number: number;
  name: string;
  label: string;
  range: TimelineRange | null;
  movement: boolean;
  video: boolean;
}

interface TimelineStepsProps {
  label: string;
  steps: readonly TimelineStep[];
  activeKey: number | null;
  selectedKey: number | null;
  revealSeconds?: number | null;
  onSelect: (key: number) => void;
}

export const TimelineSteps: FC<TimelineStepsProps> = ({
  label,
  steps,
  activeKey,
  selectedKey,
  revealSeconds = null,
  onSelect,
}) => {
  const { length } = useTimeline();
  const blocks = spanSharesOf(steps, length);

  return (
    <TimelineStrip>
      <KkTimeline.Steps
        label={label}
        blocks={blocks}
        activeKey={activeKey}
        selectedKey={selectedKey}
        interactive
        revealSeconds={revealSeconds}
        onSelect={onSelect}
      />
    </TimelineStrip>
  );
};
