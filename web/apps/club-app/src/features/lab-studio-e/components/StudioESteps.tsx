import { KkStudioESteps } from '@furria/ui/KkStudioESteps';
import type { FC } from 'react';
import type { StudioESteps as StudioEStepsModel } from '../hooks/use-studio-e-steps';
import {
  STUDIO_E_STEPS_CLOSE,
  STUDIO_E_STEPS_FILMED,
  STUDIO_E_STEPS_TITLE,
} from '../studio-e-copy';

interface StudioEStepsProps {
  steps: StudioEStepsModel;
}

export const StudioESteps: FC<StudioEStepsProps> = ({ steps }) => {
  const groups = steps.groups.map((group) => {
    const rows = group.rows.map((row) => (
      <KkStudioESteps.Row
        key={row.stepId}
        number={row.number}
        name={row.name}
        meta={row.meta}
        filmed={row.filmed}
        filmedLabel={STUDIO_E_STEPS_FILMED}
        current={row.current}
        looped={row.looped}
        label={row.label}
        loopLabel={row.loopLabel}
        onPress={row.press}
        onLoop={row.loop}
      >
        <KkStudioESteps.Thumb dots={row.dots} aspect={steps.aspect} />
      </KkStudioESteps.Row>
    ));

    return (
      <KkStudioESteps.Group key={group.key} label={group.name}>
        <KkStudioESteps.GroupHead name={group.name} meta={group.meta} />
        {rows}
      </KkStudioESteps.Group>
    );
  });

  return (
    <KkStudioESteps open={steps.open} label={STUDIO_E_STEPS_TITLE} onClose={steps.close}>
      <KkStudioESteps.Head>
        <KkStudioESteps.Title text={STUDIO_E_STEPS_TITLE} />
        <KkStudioESteps.Close label={STUDIO_E_STEPS_CLOSE} onClose={steps.close} />
      </KkStudioESteps.Head>
      <KkStudioESteps.List>{groups}</KkStudioESteps.List>
    </KkStudioESteps>
  );
};
