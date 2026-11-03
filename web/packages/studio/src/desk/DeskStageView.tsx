import { DESK_STAGE } from '@furria/studio/desk-copy';
import { StudioEditStage } from '@furria/studio/StudioEditStage';
import type { ActDesk } from '@furria/studio/use-act-desk';
import type { FC } from 'react';

interface DeskStageViewProps {
  desk: ActDesk;
}

export const DeskStageView: FC<DeskStageViewProps> = ({ desk }) => (
  <StudioEditStage
    screen={desk.screen}
    editor={desk.editor}
    label={DESK_STAGE}
    onGrab={desk.focusSpots}
  />
);
