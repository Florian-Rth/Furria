import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import type { FC } from 'react';
import type { PracticeStepGroupView } from '../hooks/use-practice-steps';
import { PRACTICE_STEPS_FILMED } from '../practice-copy';

interface PracticeStepGroupsProps {
  groups: readonly PracticeStepGroupView[];
  aspect: number;
}

export const PracticeStepGroups: FC<PracticeStepGroupsProps> = ({ groups, aspect }) =>
  groups.map((group) => {
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
        <KkPracticeSteps.Thumb dots={row.dots} aspect={aspect} />
      </KkPracticeSteps.Row>
    ));

    return (
      <KkPracticeSteps.Group key={group.key} label={group.name}>
        <KkPracticeSteps.GroupHead name={group.name} meta={group.meta} />
        {rows}
      </KkPracticeSteps.Group>
    );
  });
