import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { HoldingTask } from '../hooks/use-holding-form-target';
import { EDIT_HOLDING_LABEL, END_HOLDING_LABEL } from '../roles-hub-copy';

interface HoldingTaskButtonsProps {
  roleHoldingId: number;
  endable: boolean;
  onTask: (roleHoldingId: number, task: HoldingTask) => void;
}

export const HoldingTaskButtons: FC<HoldingTaskButtonsProps> = ({
  roleHoldingId,
  endable,
  onTask,
}) => {
  const edit = (): void => {
    onTask(roleHoldingId, 'edit');
  };
  const end = (): void => {
    onTask(roleHoldingId, 'end');
  };
  const endButton = endable ? (
    <KkButton size="small" variant="text" onClick={end}>
      {END_HOLDING_LABEL}
    </KkButton>
  ) : null;

  return (
    <>
      <KkButton size="small" variant="text" onClick={edit}>
        {EDIT_HOLDING_LABEL}
      </KkButton>
      {endButton}
    </>
  );
};
