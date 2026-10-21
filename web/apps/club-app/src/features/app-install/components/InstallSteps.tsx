import { KkInstallStage } from '@furria/ui';
import type { FC } from 'react';
import { INSTALL_STEPS, STEPS_LABEL } from '../install-copy';
import type { InstallStepKey } from '../install-guide';

interface InstallStepsProps {
  steps: readonly InstallStepKey[];
}

export const InstallSteps: FC<InstallStepsProps> = ({ steps }) => {
  const lastIndex = steps.length - 1;
  const items = steps.map((key, index) => (
    <KkInstallStage.Step
      key={key}
      index={index}
      isLast={index === lastIndex}
      {...INSTALL_STEPS[key]}
    />
  ));

  return <KkInstallStage.Steps label={STEPS_LABEL}>{items}</KkInstallStage.Steps>;
};
