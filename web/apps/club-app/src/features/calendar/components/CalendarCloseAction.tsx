import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import { useConfirmStep } from '../hooks/use-confirm-step';
import type { CalendarConfirmCopy } from './CalendarConfirmDialog';
import { CalendarConfirmDialog } from './CalendarConfirmDialog';

interface CalendarCloseActionProps {
  label: string;
  copy: CalendarConfirmCopy;
  isClosing: boolean;
  onClose: () => void;
}

export const CalendarCloseAction: FC<CalendarCloseActionProps> = ({
  label,
  copy,
  isClosing,
  onClose,
}) => {
  const step = useConfirmStep(onClose);

  return (
    <>
      <KkButton
        variant="outlined"
        size="small"
        onClick={step.ask}
        loading={isClosing}
        sx={{ alignSelf: 'flex-start' }}
      >
        {label}
      </KkButton>
      <CalendarConfirmDialog
        open={step.isAsked}
        copy={copy}
        onConfirm={step.confirm}
        onCancel={step.cancel}
      />
    </>
  );
};
