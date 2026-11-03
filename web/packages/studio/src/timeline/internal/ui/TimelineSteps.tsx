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
  selectedKey?: number | null;
  revealSeconds?: number | null;
  lane?: string;
  onSelect?: (key: number) => void;
}

const IGNORE = (): void => undefined;

export const TimelineSteps: FC<TimelineStepsProps> = ({
  label,
  steps,
  activeKey,
  selectedKey = null,
  revealSeconds = null,
  lane,
  onSelect,
}) => {
  const { length, centre } = useTimeline();
  const pan = centre === null ? null : { x: centre.x, width: centre.contentWidth };
  const blocks = spanSharesOf(steps, length);
  const interactive = onSelect !== undefined;
  const select = onSelect ?? IGNORE;

  return (
    <TimelineStrip>
      <KkTimeline.Steps
        label={label}
        blocks={blocks}
        activeKey={activeKey}
        selectedKey={selectedKey}
        interactive={interactive}
        revealSeconds={revealSeconds}
        lane={lane}
        pan={pan}
        onSelect={select}
      />
    </TimelineStrip>
  );
};
