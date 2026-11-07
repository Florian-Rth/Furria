import { KkSsStages } from '@furria/ui/KkSsStages';
import type { FC } from 'react';
import type { StepSetup } from '../hooks/use-step-setup';
import { SS_STAGES, stageCellLabelOf } from '../setup-copy';

interface SsStageBarProps {
  setup: StepSetup;
}

export const SsStageBar: FC<SsStageBarProps> = ({ setup }) => {
  const cells = setup.cells.map((cell) => ({
    key: cell.stage,
    label: stageCellLabelOf(cell.stage, cell.state),
    state: cell.state,
    current: cell.current,
  }));

  return <KkSsStages label={SS_STAGES} cells={cells} />;
};
