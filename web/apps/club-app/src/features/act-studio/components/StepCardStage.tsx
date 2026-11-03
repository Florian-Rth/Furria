import { STEP_CARD_STAGE } from '@furria/studio/step-cards-copy';
import type { FC } from 'react';
import type { ActStudioStage } from '../hooks/use-act-studio-stage';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { StudioEditStage } from './StudioEditStage';

interface StepCardStageProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardStage: FC<StepCardStageProps> = ({ screen, editor }) => (
  <StudioEditStage screen={screen} editor={editor} label={STEP_CARD_STAGE} />
);
