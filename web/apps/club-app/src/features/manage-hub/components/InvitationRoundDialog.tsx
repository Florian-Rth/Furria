import type { KkConfirmFact } from '@furria/ui';
import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import type { InvitationRoundControl } from '../hooks/use-invitation-round';
import type { InvitationRoundAct } from '../invitation-round-labels';
import {
  ROUND_CANCEL_LABEL,
  ROUND_CLOSE_LABEL,
  ROUND_EYEBROW,
  toWithoutEmailFact,
} from '../invitation-round-labels';

const WITHOUT_EMAIL_LABEL = 'Ohne E-Mail-Adresse';

interface InvitationRoundDialogProps {
  act: InvitationRoundAct;
  eligibleWithoutEmailCount: number;
  control: InvitationRoundControl;
}

export const InvitationRoundDialog: FC<InvitationRoundDialogProps> = ({
  act,
  eligibleWithoutEmailCount,
  control,
}) => {
  const facts: KkConfirmFact[] = [
    { label: WITHOUT_EMAIL_LABEL, value: toWithoutEmailFact(eligibleWithoutEmailCount) },
  ];

  return (
    <KkConfirmDialog
      open={control.isOpen}
      onClose={control.close}
      onConfirm={control.submit}
      eyebrow={ROUND_EYEBROW}
      question={act.question}
      explanation={act.explanation}
      facts={facts}
      consequence={act.consequence}
      error={control.rejection ?? undefined}
      confirmLabel={act.confirmLabel}
      cancelLabel={ROUND_CANCEL_LABEL}
      closeLabel={ROUND_CLOSE_LABEL}
      busy={control.isSending}
    />
  );
};
