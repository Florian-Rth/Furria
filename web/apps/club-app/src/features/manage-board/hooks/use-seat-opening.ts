import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useOpenBoardSeatMutation } from '../api';
import { toPersonName, toSeatConsequence } from '../manage-board-labels';
import type { BoardOffice } from '../schemas';
import { BoardSeatOpenFormSchema } from '../schemas';

export interface SeatOpeningControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  personError: string | undefined;
  sinceOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useSeatOpening = (
  office: BoardOffice,
  defaultSinceOn: string,
  today: string,
  onDone: () => void,
): SeatOpeningControl => {
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [sinceOn, setSinceOn] = useState<string | null>(defaultSinceOn);
  const [tried, setTried] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useOpenBoardSeatMutation(office.boardOfficeId, office.name);
  const parsed = BoardSeatOpenFormSchema.safeParse({ person, sinceOn });
  const issues = parsed.success || !tried ? [] : parsed.error.issues;
  const issueOf = (field: string): string | undefined =>
    issues.find((issue) => issue.path[0] === field)?.message;

  const submit = (): void => {
    setTried(true);
    setRejection(null);
    if (!parsed.success) {
      return;
    }

    const chosen = parsed.data;

    void mutation
      .mutateAsync({
        personId: chosen.person.personId,
        personName: toPersonName(chosen.person),
        sinceOn: chosen.sinceOn,
      })
      .then(onDone, (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      });
  };

  return {
    person,
    select: setPerson,
    clearPerson: () => {
      setPerson(null);
    },
    sinceOn,
    setSinceOn,
    personError: issueOf('person'),
    sinceOnError: issueOf('sinceOn'),
    consequence:
      person === null || sinceOn === null
        ? null
        : toSeatConsequence(
            toPersonName(person),
            office.name,
            office.impliedRoleName,
            sinceOn,
            today,
          ),
    rejection,
    isSaving: mutation.isPending,
    submit,
  };
};
