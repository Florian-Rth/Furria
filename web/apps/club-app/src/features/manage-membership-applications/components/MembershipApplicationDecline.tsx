import { KkConfirmDialog, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { useMembershipApplicationDecline } from '../hooks/use-membership-application-decline';
import {
  DECLINE_EXPLANATION,
  DECLINE_EYEBROW,
  DECLINE_LABEL,
  toDeclineConsequence,
  toDeclineFacts,
  toDeclineQuestion,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface MembershipApplicationDeclineProps {
  application: MembershipApplicationDetails;
}

export const MembershipApplicationDecline: FC<MembershipApplicationDeclineProps> = ({
  application,
}) => {
  const decline = useMembershipApplicationDecline(application);
  const question = toDeclineQuestion(application);
  const facts = toDeclineFacts(application);
  const consequence = toDeclineConsequence(application);
  const rejection = decline.rejection ?? undefined;

  return (
    <>
      <KkWriteScreen.Danger label={DECLINE_LABEL} onSelect={decline.open} />
      <KkConfirmDialog
        open={decline.isOpen}
        onClose={decline.close}
        onConfirm={decline.submit}
        tone="danger"
        eyebrow={DECLINE_EYEBROW}
        question={question}
        explanation={DECLINE_EXPLANATION}
        facts={facts}
        consequence={consequence}
        error={rejection}
        confirmLabel={DECLINE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={decline.isSaving}
      />
    </>
  );
};
