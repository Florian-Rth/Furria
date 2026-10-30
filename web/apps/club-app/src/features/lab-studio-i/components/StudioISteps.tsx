import { KkPracticeSteps } from '@furria/ui/KkPracticeSteps';
import { KkStudioIEnter } from '@furria/ui/KkStudioIEnter';
import type { FC } from 'react';
import type { PracticeSteps } from '@/features/act-practice/hooks/use-practice-steps';
import {
  PRACTICE_STEPS_CLOSE,
  PRACTICE_STEPS_FILMED,
  PRACTICE_STEPS_TITLE,
} from '@/features/act-practice/practice-copy';
import { STUDIO_I_EDIT, STUDIO_I_EDIT_LABEL } from '../studio-i-copy';

interface StudioIStepsProps {
  steps: PracticeSteps;
  canEdit: boolean;
  onEdit: () => void;
}

export const StudioISteps: FC<StudioIStepsProps> = ({ steps, canEdit, onEdit }) => {
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
  const edit = (): void => {
    steps.close();
    onEdit();
  };
  const enter = canEdit ? (
    <KkStudioIEnter text={STUDIO_I_EDIT} label={STUDIO_I_EDIT_LABEL} onPress={edit} />
  ) : null;

  return (
    <KkPracticeSteps open={steps.open} label={PRACTICE_STEPS_TITLE} onClose={steps.close}>
      <KkPracticeSteps.Head>
        <KkPracticeSteps.Title text={PRACTICE_STEPS_TITLE} />
        {enter}
        <KkPracticeSteps.Close label={PRACTICE_STEPS_CLOSE} onClose={steps.close} />
      </KkPracticeSteps.Head>
      <KkPracticeSteps.List>{groups}</KkPracticeSteps.List>
    </KkPracticeSteps>
  );
};
