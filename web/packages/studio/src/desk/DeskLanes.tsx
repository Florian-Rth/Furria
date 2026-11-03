import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { DeskLaneSetup } from '@furria/studio/DeskLaneSetup';
import { DESK_LANES } from '@furria/studio/desk-copy';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import type { SetupKey } from '@furria/studio/studio-setup';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import { TIMELINE_NONE } from '@furria/studio/timeline-copy';
import type { ActDesk } from '@furria/studio/use-act-desk';
import type { DeskLaneRows } from '@furria/studio/use-desk-lanes';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC, ReactNode } from 'react';

interface DeskLanesProps {
  desk: ActDesk;
  lanes: DeskLaneRows;
  setup: StudioSetup;
}

export const DeskLanes: FC<DeskLanesProps> = ({ desk, lanes, setup }) => {
  const { playback } = desk.screen;
  const none = <KkTimeline.LaneNote text={TIMELINE_NONE} />;
  const setupIn = (key: SetupKey): ReactNode => {
    const row = setup.rowOf(key);

    return row === null ? null : <DeskLaneSetup row={row} />;
  };
  const emptyLane = (key: SetupKey): ReactNode => setupIn(key) ?? none;
  const parts = { parts: lanes.parts, tone: desk.screen.tone, onSelect: desk.focusPart };
  const wave = {
    segments: playback.segments,
    peaks: playback.peaksByItem,
    cuts: true,
    beats: lanes.beats,
    note: setupIn('music'),
  };
  const steps = {
    steps: lanes.steps,
    activeKey: lanes.currentStepId,
    selectedKey: lanes.selectedStepId,
    borders: lanes.borders,
    note: lanes.steps.length === 0 ? emptyLane('steps') : null,
    onSelect: desk.focusStep,
  };
  const videos = {
    blocks: lanes.videos,
    note: lanes.videos.length === 0 ? emptyLane('video') : null,
  };
  const keys = {
    diamonds: lanes.keys,
    note: lanes.keys.length === 0 ? emptyLane('formation') : null,
  };
  const readout = <ActStudioWaveReadout readout={lanes.readout} />;

  return (
    <StudioTimeline
      label={DESK_LANES}
      density="desk"
      length={playback.length}
      centre={lanes.centre}
      ruler
      parts={parts}
      wave={wave}
      steps={steps}
      videos={videos}
      keys={keys}
      overlay={readout}
    />
  );
};
