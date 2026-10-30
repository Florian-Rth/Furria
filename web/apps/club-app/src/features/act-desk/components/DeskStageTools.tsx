import { KkLaneBar } from '@furria/ui/KkLaneBar';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import type { FC } from 'react';
import { STUDIO_ONION } from '@/features/act-studio/studio-copy';
import {
  DESK_ADD_SPOT,
  DESK_ADD_SPOT_LABEL,
  DESK_FORMATION,
  DESK_MOVEMENT,
  DESK_MULTI,
  DESK_STAGE_TOOLS,
} from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';

interface DeskStageToolsProps {
  desk: ActDesk;
}

export const DeskStageTools: FC<DeskStageToolsProps> = ({ desk }) => {
  const { editor, stageTool } = desk;
  const formation = (): void => {
    desk.chooseStageTool('formation');
  };
  const movement = (): void => {
    desk.chooseStageTool('movement');
  };
  const onFormation = stageTool === 'formation';
  const onMovement = stageTool === 'movement';
  const addSpot =
    desk.screen.evening === null ? (
      <KkLaneButton
        text={DESK_ADD_SPOT}
        glyph="add"
        label={DESK_ADD_SPOT_LABEL}
        disabled={desk.screen.stageWrites.addSpot.isPending}
        onPress={editor.addSpot}
      />
    ) : null;

  return (
    <KkLaneBar label={DESK_STAGE_TOOLS}>
      <KkLaneBar.Group label={DESK_STAGE_TOOLS}>
        <KkLaneButton
          text={DESK_FORMATION}
          glyph="formation"
          pressed={onFormation}
          onPress={formation}
        />
        <KkLaneButton text={DESK_MOVEMENT} glyph="paths" pressed={onMovement} onPress={movement} />
      </KkLaneBar.Group>
      <KkLaneBar.Group label={DESK_STAGE_TOOLS} grow>
        <KkLaneButton text={DESK_MULTI} pressed={editor.multi} onPress={editor.toggleMulti} />
        <KkLaneButton text={STUDIO_ONION} pressed={editor.onion} onPress={editor.toggleOnion} />
        {addSpot}
      </KkLaneBar.Group>
    </KkLaneBar>
  );
};
