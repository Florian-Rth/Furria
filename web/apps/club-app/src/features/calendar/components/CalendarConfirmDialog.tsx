import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';

const NO_FACTS = [] as const;

export interface CalendarConfirmCopy {
  eyebrow: string;
  question: string;
  explanation: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
}

interface CalendarConfirmDialogProps {
  open: boolean;
  copy: CalendarConfirmCopy;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CalendarConfirmDialog: FC<CalendarConfirmDialogProps> = ({
  open,
  copy,
  onConfirm,
  onCancel,
}) => (
  <KkConfirmDialog
    open={open}
    onClose={onCancel}
    onConfirm={onConfirm}
    tone="danger"
    eyebrow={copy.eyebrow}
    question={copy.question}
    explanation={copy.explanation}
    facts={NO_FACTS}
    confirmLabel={copy.confirmLabel}
    cancelLabel={copy.cancelLabel}
    closeLabel={copy.closeLabel}
  />
);
