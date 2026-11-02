import type { FC } from 'react';
import { StudioEditStage } from '@/features/act-studio/components/StudioEditStage';
import { DESK_STAGE } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';

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
