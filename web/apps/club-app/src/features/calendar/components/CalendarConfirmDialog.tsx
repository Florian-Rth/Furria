import type { KkConfirmTone } from '@furria/ui/KkConfirmDialog';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';

const NO_FACTS = [] as const;
const DEFAULT_TONE: KkConfirmTone = 'danger';

export interface CalendarConfirmCopy {
  eyebrow: string;
  question: string;
  explanation: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  tone?: KkConfirmTone;
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
}) => {
  const tone = copy.tone ?? DEFAULT_TONE;

  return (
    <KkConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      tone={tone}
      eyebrow={copy.eyebrow}
      question={copy.question}
      explanation={copy.explanation}
      facts={NO_FACTS}
      confirmLabel={copy.confirmLabel}
      cancelLabel={copy.cancelLabel}
      closeLabel={copy.closeLabel}
    />
  );
};
