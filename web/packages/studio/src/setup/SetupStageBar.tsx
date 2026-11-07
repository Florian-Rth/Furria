import { STEP_SETUP_PROGRESS, stageCellLabelOf } from '@furria/studio/step-setup-copy';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkSetupProgress } from '@furria/ui/KkSetupProgress';
import type { FC } from 'react';

interface SetupStageBarProps {
  setup: StepSetup;
}

export const SetupStageBar: FC<SetupStageBarProps> = ({ setup }) => {
  const cells = setup.cells.map((cell) => ({
    key: cell.stage,
    label: stageCellLabelOf(cell.stage, cell.state),
    state: cell.state,
    current: cell.current,
  }));

  return <KkSetupProgress label={STEP_SETUP_PROGRESS} cells={cells} />;
};
