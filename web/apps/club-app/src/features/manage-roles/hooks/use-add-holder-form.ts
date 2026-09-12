import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddRoleHoldingMutation } from '../api';
import { toHoldingConsequence, toPersonName } from '../manage-roles-labels';

interface AddHolderFormInput {
  roleId: number;
  roleName: string;
  open: boolean;
  onAdded: () => void;
}

export interface AddHolderFormControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useAddHolderForm = ({
  roleId,
  roleName,
  open,
  onAdded,
}: AddHolderFormInput): AddHolderFormControl => {
  const today = toIsoDay(new Date());
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useAddRoleHoldingMutation(roleId, roleName);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
      setSinceOn(today);
      setRejection(null);
    }
  }

  const personName = person === null ? '' : toPersonName(person);

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const submit = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { personId: person.personId, personName, sinceOn },
      {
        onSuccess: onAdded,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    person,
    select,
    clearPerson,
    sinceOn,
    setSinceOn,
    consequence:
      person === null || sinceOn === null
        ? null
        : toHoldingConsequence(personName, roleName, sinceOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit: person !== null && sinceOn !== null && !mutation.isPending,
    submit,
  };
};
