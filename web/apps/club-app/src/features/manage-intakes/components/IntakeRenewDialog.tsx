import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import type { IntakeRenewalControl } from '../hooks/use-intake-renewal';
import {
  CANCEL_LABEL,
  CLOSE_LABEL,
  RENEW_EXPLANATION,
  RENEW_EYEBROW,
  RENEW_LABEL,
  RENEW_QUESTION,
  toIntakeFacts,
} from '../intake-labels';
import type { IntakeSummary } from '../schemas';

interface IntakeRenewDialogProps {
  intake: IntakeSummary;
  renewal: IntakeRenewalControl;
}

export const IntakeRenewDialog: FC<IntakeRenewDialogProps> = ({ intake, renewal }) => {
  const facts = toIntakeFacts(intake);
  const rejection = renewal.rejection ?? undefined;

  return (
    <KkConfirmDialog
      open={renewal.isOpen}
      onClose={renewal.close}
      onConfirm={renewal.renew}
      eyebrow={RENEW_EYEBROW}
      question={RENEW_QUESTION}
      explanation={RENEW_EXPLANATION}
      facts={facts}
      error={rejection}
      confirmLabel={RENEW_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={renewal.isSaving}
    />
  );
};
