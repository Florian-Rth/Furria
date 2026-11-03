import type { KkTimelineHandleTone } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineHandle {
  key: string;
  seconds: number;
  label: string;
  valueText: string;
  onNudge: (direction: -1 | 1) => void;
}

interface TimelineHandlesProps {
  handles: readonly TimelineHandle[];
  tone?: KkTimelineHandleTone;
}

export const TimelineHandles: FC<TimelineHandlesProps> = ({ handles, tone = 'cut' }) => {
  const { length, centre } = useTimeline();
  const activeKey = centre?.activeKey ?? null;
  const marks = handles.map((handle) => (
    <KkTimeline.Handle
      key={handle.key}
      share={shareOf(handle.seconds, length)}
      label={handle.label}
      valueText={handle.valueText}
      active={handle.key === activeKey}
      tone={tone}
      onNudge={handle.onNudge}
    />
  ));

  return <TimelineStrip>{marks}</TimelineStrip>;
};
