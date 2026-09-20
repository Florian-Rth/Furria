import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useHandOutKeyMutation } from '../api';
import { toHandoutConsequence, toPersonName } from '../manage-keys-labels';

interface KeyHandoutFormInput {
  venueId: number;
  venueName: string;
  open: boolean;
  onHandedOut: () => void;
}

export interface KeyHandoutFormControl {
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

export const useKeyHandoutForm = ({
  venueId,
  venueName,
  open,
  onHandedOut,
}: KeyHandoutFormInput): KeyHandoutFormControl => {
  const today = toIsoDay(new Date());
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useHandOutKeyMutation();

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
      { venueId, venueName, personId: person.personId, personName, sinceOn },
      {
        onSuccess: onHandedOut,
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
        : toHandoutConsequence(personName, venueName, sinceOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit: person !== null && sinceOn !== null && !mutation.isPending,
    submit,
  };
};
