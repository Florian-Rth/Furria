import type { KkTimelineSpan, KkTimelineWaveLane } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { TimelineStrip } from '../layout/TimelineStrip';

const ALL_PLAYED = 1;

interface TimelineCentrePlayedProps {
  bars: readonly number[];
  span: KkTimelineSpan;
  lane?: KkTimelineWaveLane;
  within?: KkTimelineSpan | null;
}

export const TimelineCentrePlayed: FC<TimelineCentrePlayedProps> = ({
  bars,
  span,
  lane = 'wave',
  within = null,
}) => (
  <KkTimeline.Half side="before">
    <TimelineStrip>
      <KkTimeline.Played bars={bars} share={ALL_PLAYED} span={span} lane={lane} within={within} />
    </TimelineStrip>
  </KkTimeline.Half>
);
