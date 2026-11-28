import { PracticeStepGroups } from '@furria/studio/PracticeStepGroups';
import {
  PRACTICE_KEYS,
  PRACTICE_KEYS_TITLE,
  PRACTICE_STEPS_CLOSE,
  PRACTICE_STEPS_TITLE,
} from '@furria/studio/practice-copy';
import type { PracticeSteps as PracticeStepsModel } from '@furria/studio/use-practice-steps';
import { KkKeyList } from '@furria/ui/KkKeyList';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';

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
      <KkPracticeSteps.Keys>
        <KkKeyList title={PRACTICE_KEYS_TITLE} entries={PRACTICE_KEYS} />
      </KkPracticeSteps.Keys>
    </KkPracticeSteps.List>
  </KkPracticeSteps>
);
