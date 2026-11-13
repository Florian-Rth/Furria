import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import { toAddOnRemovalQuestion, toDiscardedAnswersLabel } from '../calendar-labels';
import type { CalendarAddOnRemoval } from '../hooks/use-calendar-add-ons';

const EYEBROW = 'FUNKTION ENTFERNEN';
const CONFIRM_LABEL = 'Entfernen';
const CANCEL_LABEL = 'Behalten';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

interface CalendarAddOnRemovalDialogProps {
  removal: CalendarAddOnRemoval;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CalendarAddOnRemovalDialog: FC<CalendarAddOnRemovalDialogProps> = ({
  removal,
  open,
  onConfirm,
  onCancel,
}) => {
  const question = toAddOnRemovalQuestion(removal.kind);
  const explanation = toDiscardedAnswersLabel(removal.kind, removal.discardedAnswers);

  return (
    <KkConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      tone="danger"
      eyebrow={EYEBROW}
      question={question}
      explanation={explanation}
      facts={NO_FACTS}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
    />
  );
};
