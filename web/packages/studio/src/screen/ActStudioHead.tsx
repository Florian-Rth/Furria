import { PracticeCountLive } from '@furria/studio/PracticeCountLive';
import { PRACTICE_STEPS_OPEN } from '@furria/studio/practice-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { KkPracticeDescription } from '@furria/ui/KkPracticeDescription';
import { KkPracticeStepName } from '@furria/ui/KkPracticeStepName';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import type { FC } from 'react';

interface ActStudioHeadProps {
  screen: StudioScreen;
}

export const ActStudioHead: FC<ActStudioHeadProps> = ({ screen }) => {
  const { practice, steps, playback } = screen;

  return (
    <KkPracticeView.Head>
      <KkPracticeSteps.Trigger
        label={PRACTICE_STEPS_OPEN}
        expanded={steps.open}
        onOpen={steps.show}
      >
        <KkPracticeView.Titles>
          <KkPracticeStepName stepKey={practice.stepKey} name={practice.stepName} />
          <KkPracticeDescription stepKey={practice.stepKey} text={practice.note} />
        </KkPracticeView.Titles>
      </KkPracticeSteps.Trigger>
      <PracticeCountLive player={playback.player} segments={playback.segments} />
    </KkPracticeView.Head>
  );
};
