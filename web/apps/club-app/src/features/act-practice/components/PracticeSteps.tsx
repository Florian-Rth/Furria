import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { PracticeSteps as PracticeStepsModel } from '../hooks/use-practice-steps';
import { PRACTICE_STEPS_CLOSE, PRACTICE_STEPS_TITLE } from '../practice-copy';
import { PracticeStepGroups } from './PracticeStepGroups';

interface PracticeStepsProps {
  steps: PracticeStepsModel;
}

export const PracticeSteps: FC<PracticeStepsProps> = ({ steps }) => (
  <KkPracticeSteps open={steps.open} label={PRACTICE_STEPS_TITLE} onClose={steps.close}>
    <KkPracticeSteps.Head>
      <KkPracticeSteps.Title text={PRACTICE_STEPS_TITLE} />
      <KkPracticeSteps.Close label={PRACTICE_STEPS_CLOSE} onClose={steps.close} />
    </KkPracticeSteps.Head>
    <KkPracticeSteps.List>
      <PracticeStepGroups groups={steps.groups} aspect={steps.aspect} />
    </KkPracticeSteps.List>
  </KkPracticeSteps>
);
