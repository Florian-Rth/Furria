import { Timeline } from '@furria/studio/Timeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC, ReactNode } from 'react';
import { ActStudioWaveReadout } from '@/features/act-studio/components/ActStudioWaveReadout';
import type { StudioSetup } from '@/features/act-studio/hooks/use-studio-setup';
import type { SetupKey } from '@/features/act-studio/studio-setup';
import {
  DESK_LANES,
  DESK_MUSIC,
  DESK_NONE,
  DESK_PARTS,
  DESK_PATHS,
  DESK_RULER,
  DESK_STEPS,
  DESK_VIDEO,
} from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import type { DeskLaneRows } from '../hooks/use-desk-lanes';
import { DESK_LANE } from '../hooks/use-desk-lanes';
import { DeskLaneSetup } from './DeskLaneSetup';

interface DeskLanesProps {
  desk: ActDesk;
  lanes: DeskLaneRows;
  setup: StudioSetup;
}

export const DeskLanes: FC<DeskLanesProps> = ({ desk, lanes, setup }) => {
  const { playback } = desk.screen;
  const none = <KkTimeline.LaneNote text={DESK_NONE} />;
  const setupIn = (key: SetupKey): ReactNode => {
    const row = setup.rowOf(key);

    return row === null ? null : <DeskLaneSetup row={row} />;
  };
  const emptyLane = (key: SetupKey): ReactNode => setupIn(key) ?? none;
  const partNote = lanes.parts.length === 0 ? none : null;
  const stepNote = lanes.steps.length === 0 ? emptyLane('steps') : null;
  const videoNote = lanes.videos.length === 0 ? emptyLane('video') : null;
  const keyNote = lanes.keys.length === 0 ? emptyLane('formation') : null;
  const readout = <ActStudioWaveReadout readout={lanes.readout} />;

  return (
    <Timeline
      label={DESK_LANES}
      density="desk"
      length={playback.length}
      centre={lanes.centre}
      overlay={readout}
    >
      <Timeline.Lane lane={DESK_LANE.ruler} label={DESK_RULER} size="ruler">
        <Timeline.Marks marks={lanes.ruler} edge="top" />
      </Timeline.Lane>
      <Timeline.Lane lane={DESK_LANE.parts} label={DESK_PARTS} size="thin">
        <Timeline.Blocks tone="part" blocks={lanes.parts} />
        {partNote}
      </Timeline.Lane>
      <Timeline.Lane lane={DESK_LANE.steps} label={DESK_STEPS} size="lane">
        <Timeline.Blocks tone="step" blocks={lanes.steps} />
        <Timeline.Handles handles={lanes.borders} tone="border" />
        {stepNote}
      </Timeline.Lane>
      <Timeline.Lane lane={DESK_LANE.music} label={DESK_MUSIC} size="wave">
        <Timeline.Wave segments={playback.segments} peaks={playback.peaksByItem} />
        <Timeline.Marks marks={lanes.beats} edge="bottom" />
        {setupIn('music')}
      </Timeline.Lane>
      <Timeline.Lane lane={DESK_LANE.video} label={DESK_VIDEO} size="lane">
        <Timeline.Blocks tone="video" blocks={lanes.videos} />
        {videoNote}
      </Timeline.Lane>
      <Timeline.Lane lane={DESK_LANE.keys} label={DESK_PATHS} aside={lanes.keysAside} size="lane">
        <Timeline.Diamonds diamonds={lanes.keys} />
        {keyNote}
      </Timeline.Lane>
      <Timeline.Snap />
    </Timeline>
  );
};
