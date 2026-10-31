import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { ActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import { useStepDesk } from '../hooks/use-step-desk';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_STEP_DESK, STUDIO_STEP_DESK_CLOSE } from '../studio-copy';
import { ActStudioStepDeskBody } from './ActStudioStepDeskBody';

interface ActStudioStepDeskProps {
  screen: StudioScreen;
  tool: ActStudioStepTool;
}

export const ActStudioStepDesk: FC<ActStudioStepDeskProps> = ({ screen, tool }) => {
  const desk = useStepDesk(screen, tool);
  const open = tool.deskOpen && desk !== null;
  const title = desk?.title ?? STUDIO_STEP_DESK;
  const body = desk === null ? null : <ActStudioStepDeskBody desk={desk} />;

  return (
    <KkPracticeSteps open={open} label={STUDIO_STEP_DESK} onClose={tool.closeDesk}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={title} />
        <KkPracticeSteps.Close label={STUDIO_STEP_DESK_CLOSE} onClose={tool.closeDesk} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{body}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
