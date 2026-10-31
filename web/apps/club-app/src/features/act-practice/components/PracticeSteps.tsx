import { KkKeyList } from '@furria/ui/KkKeyList';
import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { PracticeSteps as PracticeStepsModel } from '../hooks/use-practice-steps';
import {
  PRACTICE_KEYS,
  PRACTICE_KEYS_TITLE,
  PRACTICE_STEPS_CLOSE,
  PRACTICE_STEPS_TITLE,
  PRACTICE_TRAINING_START,
} from '../practice-copy';
import { PracticeStepGroups } from './PracticeStepGroups';

interface PracticeStepsProps {
  steps: PracticeStepsModel;
  onTraining: (() => void) | null;
}

export const PracticeSteps: FC<PracticeStepsProps> = ({ steps, onTraining }) => {
  const training =
    onTraining === null ? null : (
      <KkPracticeSteps.Training text={PRACTICE_TRAINING_START} onStart={onTraining} />
    );

  return (
    <KkPracticeSteps open={steps.open} label={PRACTICE_STEPS_TITLE} onClose={steps.close}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={PRACTICE_STEPS_TITLE} />
        {training}
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
};
