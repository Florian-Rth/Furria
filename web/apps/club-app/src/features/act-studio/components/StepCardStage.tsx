import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STEP_CARD_STAGE } from '../step-cards-copy';
import { StudioEditStage } from './StudioEditStage';

interface StepCardStageProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardStage: FC<StepCardStageProps> = ({ screen, editor }) => (
  <StudioEditStage screen={screen} editor={editor} label={STEP_CARD_STAGE} />
);
