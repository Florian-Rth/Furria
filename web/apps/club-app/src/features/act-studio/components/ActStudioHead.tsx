import { KkPracticeDescription } from '@furria/ui/KkPracticeDescription';
import { KkPracticeStepName } from '@furria/ui/KkPracticeStepName';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkPracticeView } from '@furria/ui/KkPracticeView';
import type { FC } from 'react';
import { PracticeCountLive } from '@/features/act-practice/components/PracticeCountLive';
import { PRACTICE_STEPS_OPEN } from '@/features/act-practice/practice-copy';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { ActStudioStepTexts } from './ActStudioStepTexts';

interface ActStudioHeadProps {
  screen: StudioScreen;
}

export const ActStudioHead: FC<ActStudioHeadProps> = ({ screen }) => {
  const { practice, steps, playback, mode } = screen;
  const writing = mode.editing && mode.tool === 'steps' && practice.step !== null;
  const titles = writing ? (
    <ActStudioStepTexts screen={screen} />
  ) : (
    <KkPracticeSteps.Trigger label={PRACTICE_STEPS_OPEN} expanded={steps.open} onOpen={steps.show}>
      <KkPracticeView.Titles>
        <KkPracticeStepName stepKey={practice.stepKey} name={practice.stepName} />
        <KkPracticeDescription stepKey={practice.stepKey} text={practice.note} />
      </KkPracticeView.Titles>
    </KkPracticeSteps.Trigger>
  );

  return (
    <KkPracticeView.Head>
      {titles}
      <PracticeCountLive player={playback.player} segments={playback.segments} />
    </KkPracticeView.Head>
  );
};
