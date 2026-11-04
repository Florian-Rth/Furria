import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { useBeerHandoverMutation } from '../api';
import type { PotSettingsForm } from './use-pot-settings-form';
import { usePotSettingsForm } from './use-pot-settings-form';

export interface HandoverForm {
  successor: PersonRef | null;
  chooseSuccessor: (person: PersonRef) => void;
  clearSuccessor: () => void;
  settings: PotSettingsForm;
  canSubmit: boolean;
  submit: () => void;
}

export const useHandoverForm = (beerPotId: number, onDone: () => void): HandoverForm => {
  const [successor, setSuccessor] = useState<PersonRef | null>(null);
  const settings = usePotSettingsForm(null);
  const handingOver = useBeerHandoverMutation();
  const canSubmit = successor !== null && settings.settings !== null && !handingOver.isPending;

  return {
    successor,
    chooseSuccessor: setSuccessor,
    clearSuccessor: () => {
      setSuccessor(null);
    },
    settings,
    canSubmit,
    submit: () => {
      if (successor !== null && settings.settings !== null) {
        handingOver.mutate(
          { beerPotId, successorPersonId: successor.personId, settings: settings.settings },
          { onSuccess: onDone },
        );
      }
    },
  };
};
