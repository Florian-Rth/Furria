import { SS_STAGES, stageCellLabelOf } from '@furria/studio/step-setup-copy';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { KkSsStages } from '@furria/ui/KkSsStages';
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

  return <KkSsStages label={SS_STAGES} cells={cells} />;
};
