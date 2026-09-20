import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useOpenBoardSeatMutation } from '../api';
import { toPersonName, toSeatConsequence } from '../manage-board-labels';

interface OpenSeatFormInput {
  boardOfficeId: number;
  officeName: string;
  impliedRoleName: string | null;
  open: boolean;
  onOpened: () => void;
}

export interface OpenSeatFormControl {
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

export const useOpenSeatForm = ({
  boardOfficeId,
  officeName,
  impliedRoleName,
  open,
  onOpened,
}: OpenSeatFormInput): OpenSeatFormControl => {
  const today = toIsoDay(new Date());
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const [shownOfficeId, setShownOfficeId] = useState(boardOfficeId);
  const mutation = useOpenBoardSeatMutation(boardOfficeId, officeName);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
      setSinceOn(today);
      setRejection(null);
    }
  }
  if (shownOfficeId !== boardOfficeId) {
    setShownOfficeId(boardOfficeId);
    setPerson(null);
    setSinceOn(today);
    setRejection(null);
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
        onSuccess: onOpened,
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
        : toSeatConsequence(personName, officeName, impliedRoleName, sinceOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit: person !== null && sinceOn !== null && !mutation.isPending,
    submit,
  };
};
