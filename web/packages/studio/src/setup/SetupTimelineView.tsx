import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import { SETUP_TIMELINE } from '@furria/studio/step-setup-copy';
import type { TimelineDensity } from '@furria/studio/Timeline';
import type { SetupTimeline } from '@furria/studio/use-setup-timeline';
import type { KkTimelineLaneKind } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';

const FILL = { height: '100%' } as const;

interface SetupTimelineViewProps {
  timeline: SetupTimeline;
  focus: KkTimelineLaneKind | null;
  wide: boolean;
}

export const SetupTimelineView: FC<SetupTimelineViewProps> = ({ timeline, focus, wide }) => {
  const density: TimelineDensity = wide ? 'edit' : 'setup';
  const tagged = !wide;
  const readout = <ActStudioWaveReadout readout={timeline.readout} />;
  const { videoNote } = timeline;
  const note = videoNote === null ? null : <KkTimeline.LaneNote text={videoNote} />;
  const videos = { ...timeline.videos, note };

  return (
    <StudioTimeline
      label={SETUP_TIMELINE}
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
