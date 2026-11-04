import { useState } from 'react';
import { useMeQuery } from '@/features/session/api';
import type { PersonRef } from '@/lib/api/schemas';
import { useOpenBeerPotMutation } from '../api';
import type { PotSettingsForm } from './use-pot-settings-form';
import { usePotSettingsForm } from './use-pot-settings-form';

export interface OpenPotForm {
  owner: PersonRef | null;
  chooseOwner: (person: PersonRef) => void;
  clearOwner: () => void;
  settings: PotSettingsForm;
  canSubmit: boolean;
  busy: boolean;
  submit: () => void;
}

export const useOpenPotForm = (): OpenPotForm => {
  const me = useMeQuery().data?.person ?? null;
  const [picked, setPicked] = useState<PersonRef | null | undefined>(undefined);
  const settings = usePotSettingsForm(null);
  const opening = useOpenBeerPotMutation();
  const myself: PersonRef | null =
    me === null ? null : { personId: me.id, firstName: me.firstName, lastName: me.lastName };
  const owner = picked === undefined ? myself : picked;

  return {
    owner,
    chooseOwner: setPicked,
    clearOwner: () => {
      setPicked(null);
    },
    settings,
    canSubmit: owner !== null && settings.settings !== null && !opening.isPending,
    busy: opening.isPending,
    submit: () => {
      if (owner !== null && settings.settings !== null) {
        opening.mutate({ ownerPersonId: owner.personId, settings: settings.settings });
      }
    },
  };
};
