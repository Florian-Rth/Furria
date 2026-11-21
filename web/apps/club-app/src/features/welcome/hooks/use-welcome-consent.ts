import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { useState } from 'react';
import { useClubGroupConsentMutation } from '@/features/profile/api';
import { useMeQuery } from '@/features/session/api';
import { CONSENT_NO_PHONE, CONSENT_PHONE_LABEL } from '../welcome-copy';

export interface WelcomeConsentControl {
  isOpen: boolean;
  facts: KkConfirmFact[];
  isSaving: boolean;
  agree: () => void;
  decline: () => void;
}

export const useWelcomeConsent = (isAsked: boolean): WelcomeConsentControl => {
  const phone = useMeQuery().data?.person?.phone ?? null;
  const mutation = useClubGroupConsentMutation();
  const [isAnswered, setIsAnswered] = useState(false);

  return {
    isOpen: isAsked && !isAnswered,
    facts: [{ label: CONSENT_PHONE_LABEL, value: phone ?? CONSENT_NO_PHONE }],
    isSaving: mutation.isPending,
    agree: () => {
      mutation.mutate(true, {
        onSettled: () => {
          setIsAnswered(true);
        },
      });
    },
    decline: () => {
      setIsAnswered(true);
    },
  };
};
