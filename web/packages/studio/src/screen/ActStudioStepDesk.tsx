import { ActStudioStepDeskBody } from '@furria/studio/ActStudioStepDeskBody';
import { STUDIO_STEP_DESK, STUDIO_STEP_DESK_CLOSE } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStepTool } from '@furria/studio/use-act-studio-step-tool';
import { useStepDesk } from '@furria/studio/use-step-desk';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';

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
