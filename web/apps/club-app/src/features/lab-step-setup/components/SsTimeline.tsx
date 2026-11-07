import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import type { TimelineDensity } from '@furria/studio/Timeline';
import type { KkTimelineLaneKind } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import type { SetupTimeline } from '../hooks/use-setup-timeline';
import { SS_TIMELINE } from '../setup-copy';

const FILL = { height: '100%' } as const;

interface SsTimelineProps {
  timeline: SetupTimeline;
  focus: KkTimelineLaneKind | null;
  wide: boolean;
}

export const SsTimeline: FC<SsTimelineProps> = ({ timeline, focus, wide }) => {
  const density: TimelineDensity = wide ? 'edit' : 'setup';
  const tagged = !wide;
  const readout = <ActStudioWaveReadout readout={timeline.readout} />;
  const { videoNote } = timeline;
  const note = videoNote === null ? null : <KkTimeline.LaneNote text={videoNote} />;
  const videos = { ...timeline.videos, note };

  return (
    <StudioTimeline
      label={SS_TIMELINE}
      density={density}
      playheadTag={tagged}
      length={timeline.length}
      centre={timeline.centre}
      ruler
      wave={timeline.wave}
      parts={timeline.parts}
      steps={timeline.steps}
      videos={videos}
      overlay={readout}
      focus={focus}
      sx={FILL}
    />
  );
};
