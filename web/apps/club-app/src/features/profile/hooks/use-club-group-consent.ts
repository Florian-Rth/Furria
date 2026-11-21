import { useClubGroupConsentMutation } from '../api';
import { toVisibilityErrorMessage } from '../profile-messages';

export interface ClubGroupConsentControl {
  hasConsented: boolean;
  toggle: (consent: boolean) => void;
  isSaving: boolean;
  error: string | undefined;
}

export const useClubGroupConsent = (clubGroupConsent: boolean): ClubGroupConsentControl => {
  const mutation = useClubGroupConsentMutation();

  return {
    hasConsented: clubGroupConsent,
    toggle: (consent) => {
      mutation.mutate(consent);
    },
    isSaving: mutation.isPending,
    error: toVisibilityErrorMessage(mutation.error) ?? undefined,
  };
};
