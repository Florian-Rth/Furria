import { KkStudioCTimeline } from '@furria/ui/KkStudioCTimeline';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useElementWidth } from '../hooks/use-element-width';
import { useLaneScrub } from '../hooks/use-lane-scrub';
import type { StudioCDesk } from '../hooks/use-studio-c-desk';
import { STUDIO_C_TIMELINE_LABEL, studioCLaneLabelsOf } from '../studio-c-copy';
import { studioCLanesOf } from '../studio-c-lanes';
import { StudioCLoopShade } from './StudioCLoopShade';
import { StudioCPartBlocks } from './StudioCPartBlocks';
import { StudioCStepBlocks } from './StudioCStepBlocks';
import { StudioCTrack } from './StudioCTrack';

interface StudioCLanesProps {
  desk: StudioCDesk;
  studio: Studio;
}

export const StudioCLanes: FC<StudioCLanesProps> = ({ desk, studio }) => {
  const viewport = useElementWidth();
  const { playback } = desk;
  const lanes = studioCLanesOf(desk, studio, viewport.width);
  const scrub = useLaneScrub(playback.player, lanes.pixelsPerSecond, playback.length);
  const laneLabels = studioCLaneLabelsOf(
    desk.videoSpans.length > 0,
    lanes.formationMarks.length > 0,
    desk.ownPath !== null,
  );
  const labels = <KkStudioCTimeline.Labels lanes={laneLabels} />;

  return (
    <KkStudioCTimeline
      label={STUDIO_C_TIMELINE_LABEL}
      labels={labels}
      viewportRef={viewport.ref}
      onPointerDown={scrub.onPointerDown}
      onPointerMove={scrub.onPointerMove}
      onPointerUp={scrub.onPointerUp}
      onPointerCancel={scrub.onPointerCancel}
    >
      <StudioCTrack
        player={playback.player}
        pixelsPerSecond={lanes.pixelsPerSecond}
        trackWidth={lanes.trackWidth}
        viewportWidth={viewport.width}
      >
        <KkStudioCTimeline.Lane kind="part">
          <StudioCPartBlocks playback={playback} pixelsPerSecond={lanes.pixelsPerSecond} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="step">
          <StudioCStepBlocks playback={playback} pixelsPerSecond={lanes.pixelsPerSecond} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="count">
          <KkStudioCTimeline.Ticks ticks={lanes.ticks} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="wave">
          <KkStudioCTimeline.Wave values={lanes.wave} width={lanes.trackWidth} cuts={lanes.cuts} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="video">
          <KkStudioCTimeline.Spans spans={lanes.videoSpans} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="formation">
          <KkStudioCTimeline.Marks marks={lanes.formationMarks} />
        </KkStudioCTimeline.Lane>
        <KkStudioCTimeline.Lane kind="own">
          <KkStudioCTimeline.Spans spans={lanes.ownSpans} />
          <KkStudioCTimeline.Marks marks={lanes.ownMarks} />
        </KkStudioCTimeline.Lane>
        <StudioCLoopShade loop={playback.state.loop} pixelsPerSecond={lanes.pixelsPerSecond} />
      </StudioCTrack>
    </KkStudioCTimeline>
  );
};
