import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import type { FC } from 'react';
import { CLUB_GROUP_CONSENT_TITLE } from '@/lib/club-group-consent-copy';
import { useWelcomeConsent } from '../hooks/use-welcome-consent';
import {
  CONSENT_CANCEL_LABEL,
  CONSENT_CONFIRM_LABEL,
  CONSENT_EXPLANATION,
  CONSENT_QUESTION,
} from '../welcome-copy';

interface WelcomeConsentDialogProps {
  isAsked: boolean;
}

export const WelcomeConsentDialog: FC<WelcomeConsentDialogProps> = ({ isAsked }) => {
  const consent = useWelcomeConsent(isAsked);

  return (
    <KkConfirmDialog
      open={consent.isOpen}
      onClose={consent.decline}
      onConfirm={consent.agree}
      eyebrow={CLUB_GROUP_CONSENT_TITLE}
      question={CONSENT_QUESTION}
      explanation={CONSENT_EXPLANATION}
      facts={consent.facts}
      confirmLabel={CONSENT_CONFIRM_LABEL}
      cancelLabel={CONSENT_CANCEL_LABEL}
      closeLabel={CONSENT_CANCEL_LABEL}
      busy={consent.isSaving}
    />
  );
};
