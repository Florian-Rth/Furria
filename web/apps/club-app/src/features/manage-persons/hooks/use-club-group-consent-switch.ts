import { hasAccount } from '@/features/account-access/access-actions';
import { usePersonClubGroupConsentMutation } from '../api';
import type { PersonDetails } from '../schemas';

export interface ClubGroupConsentSwitchControl {
  checked: boolean;
  busy: boolean;
  decidesHerself: boolean;
  onChange: (next: boolean) => void;
}

export const useClubGroupConsentSwitch = (person: PersonDetails): ClubGroupConsentSwitchControl => {
  const mutation = usePersonClubGroupConsentMutation(person.personId);

  return {
    checked: mutation.isPending ? mutation.variables : person.clubGroupConsent,
    busy: mutation.isPending,
    decidesHerself: hasAccount(person.access),
    onChange: (next) => {
      mutation.mutate(next);
    },
  };
};
