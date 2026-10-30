import { KkButton } from '@furria/ui/KkButton';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import { PracticeStepGroups } from '@/features/act-practice/components/PracticeStepGroups';
import { useActStudioRail } from '../hooks/use-act-studio-rail';
import type { ActStudioStepTool } from '../hooks/use-act-studio-step-tool';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_MARK_HERE, STUDIO_RAIL_LABEL, STUDIO_RAIL_TITLE } from '../studio-copy';

interface ActStudioStepRailProps {
  screen: StudioScreen;
  tool: ActStudioStepTool;
}

export const ActStudioStepRail: FC<ActStudioStepRailProps> = ({ screen, tool }) => {
  const groups = useActStudioRail(screen, tool);

  return (
    <KkPracticeSteps.Panel label={STUDIO_RAIL_LABEL}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={STUDIO_RAIL_TITLE} />
        <KkButton
          variant="outlined"
          size="small"
          disabled={!tool.canMark}
          loading={screen.manual.mark.isPending}
          onClick={tool.markHere}
        >
          {STUDIO_MARK_HERE}
        </KkButton>
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>
        <PracticeStepGroups groups={groups} aspect={screen.steps.aspect} />
      </KkPracticeSteps.List>
    </KkPracticeSteps.Panel>
  );
};
