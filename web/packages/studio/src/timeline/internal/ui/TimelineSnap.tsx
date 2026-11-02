import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export const TimelineSnap: FC = () => {
  const { length, centre } = useTimeline();
  const seconds = centre?.snapSeconds ?? null;

  if (seconds === null) {
    return null;
  }

  return (
    <TimelineStrip>
      <KkTimeline.Snap share={shareOf(seconds, length)} />
    </TimelineStrip>
  );
};
