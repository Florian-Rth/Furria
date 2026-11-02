import type { KkTimelineSpan } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { TimelineStrip } from '../layout/TimelineStrip';

const ALL_PLAYED = 1;

interface TimelineCentrePlayedProps {
  bars: readonly number[];
  span: KkTimelineSpan;
}

export const TimelineCentrePlayed: FC<TimelineCentrePlayedProps> = ({ bars, span }) => (
  <KkTimeline.Half side="before">
    <TimelineStrip>
      <KkTimeline.Played bars={bars} share={ALL_PLAYED} span={span} />
    </TimelineStrip>
  </KkTimeline.Half>
);
