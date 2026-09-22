import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupAdminMutation } from '../api';
import { toAdminFunction, toAppointConsequence } from '../group-hub-labels';

interface AdminAppointmentInput {
  groupId: number;
  person: PersonRef | null;
  open: boolean;
  onAppointed: (personId: number) => void;
}

export interface AdminAppointmentControl {
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  clearRejection: () => void;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useAdminAppointment = ({
  groupId,
  person,
  open,
  onAppointed,
}: AdminAppointmentInput): AdminAppointmentControl => {
  const today = toIsoDay(new Date());
  const [functionLabel, setFunctionLabel] = useState('');
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useAddGroupAdminMutation(groupId);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setFunctionLabel('');
      setSinceOn(today);
      setRejection(null);
    }
  }

  const personName = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const canSubmit = person !== null && sinceOn !== null && !mutation.isPending;

  const clearRejection = (): void => {
    setRejection(null);
  };

  const submit = (): void => {
    if (person === null || sinceOn === null) {
      return;
    }

    const appointed = (): void => {
      onAppointed(person.personId);
    };

    setRejection(null);
    mutation.mutate(
      { personId: person.personId, personName, function: toAdminFunction(functionLabel), sinceOn },
      {
        onSuccess: appointed,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return {
    functionLabel,
    setFunctionLabel,
    sinceOn,
    setSinceOn,
    consequence:
      person === null || sinceOn === null ? null : toAppointConsequence(personName, sinceOn, today),
    rejection,
    clearRejection,
    isSaving: mutation.isPending,
    canSubmit,
    submit,
  };
};
