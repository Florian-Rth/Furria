import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupAdminMutation } from '../api';
import { toAdminFunction, toAppointConsequence } from '../group-hub-labels';

interface AddAdminFormInput {
  groupId: number;
  open: boolean;
  onAppointed: (personId: number) => void;
}

export interface AddAdminFormControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useAddAdminForm = ({
  groupId,
  open,
  onAppointed,
}: AddAdminFormInput): AddAdminFormControl => {
  const today = toIsoDay(new Date());
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [functionLabel, setFunctionLabel] = useState('');
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useAddGroupAdminMutation(groupId);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
      setFunctionLabel('');
      setSinceOn(today);
      setRejection(null);
    }
  }

  const personName = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const canSubmit = person !== null && sinceOn !== null && !mutation.isPending;

  const submit = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    const appointed = (): void => {
      onAppointed(person.personId);
    };

    setRejection(null);
    mutation.mutate(
      {
        personId: person.personId,
        personName,
        function: toAdminFunction(functionLabel),
        sinceOn,
      },
      {
        onSuccess: appointed,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  return {
    person,
    select,
    clearPerson,
    functionLabel,
    setFunctionLabel,
    sinceOn,
    setSinceOn,
    consequence:
      person === null || sinceOn === null ? null : toAppointConsequence(personName, sinceOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit,
    submit,
  };
};
