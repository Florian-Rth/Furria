import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import type { FC, ReactNode } from 'react';
import { useLaneBorders } from '../hooks/use-lane-borders';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useLaneKeys } from '../hooks/use-lane-keys';
import { useLaneZoom } from '../hooks/use-lane-zoom';
import { LANE_DESK_LABEL, LANE_INSPECTOR, LANE_LANES, LANE_STAGE } from '../lane-copy';
import { LaneInspectorPane } from './LaneInspectorPane';
import { LaneLanes } from './LaneLanes';
import { LaneStageTools } from './LaneStageTools';
import { LaneStageView } from './LaneStageView';
import { LaneTopBar } from './LaneTopBar';

interface LaneDeskViewProps {
  lane: LaneEditor;
  band: ReactNode;
}

export const LaneDeskView: FC<LaneDeskViewProps> = ({ lane, band }) => {
  const { playback } = lane.screen;
  const zoom = useLaneZoom(playback.length, playback.countMarks, playback.player.position);
  const borders = useLaneBorders(lane.screen);
  useLaneKeys(lane.screen, zoom.zoom);

  return (
    <KkLaneDesk label={LANE_DESK_LABEL}>
      <KkLaneDesk.Area area="band">{band}</KkLaneDesk.Area>
      <KkLaneDesk.Area area="bar">
        <LaneTopBar lane={lane} zoom={zoom} />
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="stage">
        <KkLaneDesk.Panel label={LANE_STAGE} kind="region" padded>
          <LaneStageTools lane={lane} />
          <LaneStageView lane={lane} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="inspector">
        <KkLaneDesk.Panel label={LANE_INSPECTOR} kind="complementary">
          <LaneInspectorPane lane={lane} borders={borders} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
      <KkLaneDesk.Area area="lanes">
        <KkLaneDesk.Panel label={LANE_LANES} kind="region">
          <LaneLanes lane={lane} zoom={zoom} borders={borders} />
        </KkLaneDesk.Panel>
      </KkLaneDesk.Area>
    </KkLaneDesk>
  );
};
