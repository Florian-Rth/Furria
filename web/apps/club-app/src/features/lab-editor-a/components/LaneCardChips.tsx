import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';
import type { LaneEditor } from '../hooks/use-lane-editor';
import { useArrangeActions } from '../hooks/use-lane-inspector';
import {
  LANE_ADD_SPOT,
  LANE_ADD_SPOT_LABEL,
  LANE_CARD_TOOLS,
  LANE_FORMATION,
  LANE_MOVEMENT,
  LANE_MULTI,
} from '../lane-copy';

interface LaneCardChipsProps {
  lane: LaneEditor;
}

export const LaneCardChips: FC<LaneCardChipsProps> = ({ lane }) => {
  const { editor, stageTool } = lane;
  const arrange = useArrangeActions(lane);
  const formation = (): void => {
    lane.chooseStageTool('formation');
  };
  const movement = (): void => {
    lane.chooseStageTool('movement');
  };
  const onFormation = stageTool === 'formation';
  const onMovement = stageTool === 'movement';
  const arranging = onFormation ? arrange : [];
  const chips = arranging.map((action) => (
    <KkLaneButton
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      disabled={action.disabled}
      onPress={action.press}
    />
  ));

  return (
    <KkLaneCards.Chips label={LANE_CARD_TOOLS}>
      <KkLaneButton
        text={LANE_FORMATION}
        glyph="formation"
        pressed={onFormation}
        onPress={formation}
      />
      <KkLaneButton text={LANE_MOVEMENT} glyph="paths" pressed={onMovement} onPress={movement} />
      {chips}
      <KkLaneButton text={LANE_MULTI} pressed={editor.multi} onPress={editor.toggleMulti} />
      <KkLaneButton
        text={LANE_ADD_SPOT}
        glyph="add"
        label={LANE_ADD_SPOT_LABEL}
        onPress={editor.addSpot}
      />
    </KkLaneCards.Chips>
  );
};
