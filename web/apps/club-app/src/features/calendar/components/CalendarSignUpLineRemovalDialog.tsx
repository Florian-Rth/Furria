import type { FC } from 'react';
import type { CalendarConfirmCopy } from './CalendarConfirmDialog';
import { CalendarConfirmDialog } from './CalendarConfirmDialog';

const REMOVAL_COPY: Omit<CalendarConfirmCopy, 'question'> = {
  eyebrow: 'EINTRAG ENTFERNEN',
  explanation: 'Der Eintrag wird aus der Liste gelöscht.',
  confirmLabel: 'Entfernen',
  cancelLabel: 'Behalten',
  closeLabel: 'Schließen',
};

interface CalendarSignUpLineRemovalDialogProps {
  open: boolean;
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CalendarSignUpLineRemovalDialog: FC<CalendarSignUpLineRemovalDialogProps> = ({
  open,
  question,
  onConfirm,
  onCancel,
}) => {
  const copy: CalendarConfirmCopy = { ...REMOVAL_COPY, question };

  return (
    <CalendarConfirmDialog open={open} copy={copy} onConfirm={onConfirm} onCancel={onCancel} />
  );
};
