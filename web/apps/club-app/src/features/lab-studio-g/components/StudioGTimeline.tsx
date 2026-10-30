import { KkStudioGTimeline } from '@furria/ui/KkStudioGTimeline';
import type { FC } from 'react';
import { useStudioGLanes } from '../hooks/use-studio-g-lanes';
import { useStudioGTimeline } from '../hooks/use-studio-g-timeline';
import {
  LANE_MOVEMENT,
  LANE_MUSIC,
  LANE_PARTS,
  LANE_RULER,
  LANE_STEPS,
  LANE_VIDEOS,
  TIMELINE_LABEL,
} from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { StudioGLanes } from './StudioGLanes';
import { StudioGStripLive } from './StudioGStripLive';

const HEADS = (
  <>
    <KkStudioGTimeline.Head kind="ruler" label={LANE_RULER} />
    <KkStudioGTimeline.Head kind="music" label={LANE_MUSIC} />
    <KkStudioGTimeline.Head kind="parts" label={LANE_PARTS} />
    <KkStudioGTimeline.Head kind="steps" label={LANE_STEPS} />
    <KkStudioGTimeline.Head kind="videos" label={LANE_VIDEOS} />
    <KkStudioGTimeline.Head kind="movement" label={LANE_MOVEMENT} />
  </>
);

interface StudioGTimelineProps {
  desk: StudioGDesk;
}

export const StudioGTimeline: FC<StudioGTimelineProps> = ({ desk }) => {
  const timeline = useStudioGTimeline(desk.playback);
  const lanes = useStudioGLanes(desk, timeline.pixelsPerSecond);

  return (
    <KkStudioGTimeline label={TIMELINE_LABEL} heads={HEADS} gestures={timeline.gestures}>
      <StudioGStripLive
        player={desk.playback.player}
        pixelsPerSecond={timeline.pixelsPerSecond}
        lengthSeconds={lanes.length}
      >
        <StudioGLanes lanes={lanes} />
      </StudioGStripLive>
    </KkStudioGTimeline>
  );
};
