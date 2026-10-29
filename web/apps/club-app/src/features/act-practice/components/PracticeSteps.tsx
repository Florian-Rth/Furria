import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { PracticeSteps as PracticeStepsModel } from '../hooks/use-practice-steps';
import {
  PRACTICE_STEPS_CLOSE,
  PRACTICE_STEPS_FILMED,
  PRACTICE_STEPS_TITLE,
} from '../practice-copy';

interface PracticeStepsProps {
  steps: PracticeStepsModel;
}

export const PracticeSteps: FC<PracticeStepsProps> = ({ steps }) => {
  const groups = steps.groups.map((group) => {
    const rows = group.rows.map((row) => (
      <KkPracticeSteps.Row
        key={row.stepId}
        number={row.number}
        name={row.name}
        meta={row.meta}
        filmed={row.filmed}
        filmedLabel={PRACTICE_STEPS_FILMED}
        current={row.current}
        looped={row.looped}
        label={row.label}
        loopLabel={row.loopLabel}
        onPress={row.press}
        onLoop={row.loop}
      >
        <KkPracticeSteps.Thumb dots={row.dots} aspect={steps.aspect} />
      </KkPracticeSteps.Row>
    ));

    return (
      <KkPracticeSteps.Group key={group.key} label={group.name}>
        <KkPracticeSteps.GroupHead name={group.name} meta={group.meta} />
        {rows}
      </KkPracticeSteps.Group>
    );
  });

  return (
    <KkPracticeSteps open={steps.open} label={PRACTICE_STEPS_TITLE} onClose={steps.close}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={PRACTICE_STEPS_TITLE} />
        <KkPracticeSteps.Close label={PRACTICE_STEPS_CLOSE} onClose={steps.close} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{groups}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
