import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import { toPollCloseQuestion } from '../calendar-labels';
import type { CalendarPollControl } from '../hooks/use-calendar-poll';

const EYEBROW = 'UMFRAGE BEENDEN';
const EXPLANATION = 'Danach kann niemand mehr abstimmen.';
const CONFIRM_LABEL = 'Beenden';
const CANCEL_LABEL = 'Offen lassen';
const CLOSE_LABEL = 'Schließen';
const NO_FACTS = [] as const;

interface CalendarPollCloseDialogProps {
  control: CalendarPollControl;
}

export const CalendarPollCloseDialog: FC<CalendarPollCloseDialogProps> = ({ control }) => {
  const question = toPollCloseQuestion(control.question);

  return (
    <KkConfirmDialog
      open={control.isCloseAsked}
      onClose={control.cancelClose}
      onConfirm={control.confirmClose}
      tone="danger"
      eyebrow={EYEBROW}
      question={question}
      explanation={EXPLANATION}
      facts={NO_FACTS}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
    />
  );
};
