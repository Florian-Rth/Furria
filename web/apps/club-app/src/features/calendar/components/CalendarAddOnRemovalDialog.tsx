import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import { toAddOnRemovalQuestion, toDiscardedAnswersLabel } from '../calendar-labels';
import type { CalendarAddOnsControl } from '../hooks/use-calendar-add-ons';

const EYEBROW = 'BAUSTEIN ENTFERNEN';
const CONFIRM_LABEL = 'Entfernen';
const CANCEL_LABEL = 'Behalten';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

interface CalendarAddOnRemovalDialogProps {
  addOns: CalendarAddOnsControl;
}

export const CalendarAddOnRemovalDialog: FC<CalendarAddOnRemovalDialogProps> = ({ addOns }) => {
  const question = toAddOnRemovalQuestion(addOns.removal.addOn);
  const explanation = toDiscardedAnswersLabel(addOns.removal.discardedAnswers);

  return (
    <KkConfirmDialog
      open={addOns.isRemovalOpen}
      onClose={addOns.cancelRemoval}
      onConfirm={addOns.confirmRemoval}
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
