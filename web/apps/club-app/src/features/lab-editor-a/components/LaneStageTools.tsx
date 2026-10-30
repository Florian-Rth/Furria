import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';
import { STUDIO_ONION } from '@/features/act-studio/studio-copy';
import type { LaneEditor } from '../hooks/use-lane-editor';
import {
  LANE_ADD_SPOT,
  LANE_ADD_SPOT_LABEL,
  LANE_FORMATION,
  LANE_MOVEMENT,
  LANE_MULTI,
  LANE_STAGE_TOOLS,
} from '../lane-copy';

interface LaneStageToolsProps {
  lane: LaneEditor;
}

export const LaneStageTools: FC<LaneStageToolsProps> = ({ lane }) => {
  const { editor, stageTool } = lane;
  const formation = (): void => {
    lane.chooseStageTool('formation');
  };
  const movement = (): void => {
    lane.chooseStageTool('movement');
  };
  const onFormation = stageTool === 'formation';
  const onMovement = stageTool === 'movement';

  return (
    <KkLaneBar label={LANE_STAGE_TOOLS}>
      <KkLaneBar.Group label={LANE_STAGE_TOOLS}>
        <KkLaneButton
          text={LANE_FORMATION}
          glyph="formation"
          pressed={onFormation}
          onPress={formation}
        />
        <KkLaneButton text={LANE_MOVEMENT} glyph="paths" pressed={onMovement} onPress={movement} />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={LANE_STAGE_TOOLS} grow>
        <KkLaneButton text={LANE_MULTI} pressed={editor.multi} onPress={editor.toggleMulti} />
        <KkLaneButton text={STUDIO_ONION} pressed={editor.onion} onPress={editor.toggleOnion} />
        <KkLaneButton
          text={LANE_ADD_SPOT}
          glyph="add"
          label={LANE_ADD_SPOT_LABEL}
          onPress={editor.addSpot}
        />
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
