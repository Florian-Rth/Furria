import { StudioEditStage } from '@furria/studio/StudioEditStage';
import { STEP_CARD_STAGE } from '@furria/studio/step-cards-copy';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { FC } from 'react';
import type { StudioScreen } from '../hooks/use-studio-screen';

interface StepCardStageProps {
  screen: StudioScreen;
  editor: ActStudioStage;
}

export const StepCardStage: FC<StepCardStageProps> = ({ screen, editor }) => (
  <StudioEditStage screen={screen} editor={editor} label={STEP_CARD_STAGE} />
);
