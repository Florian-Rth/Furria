import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupMembershipMutation } from '../api';
import { toJoinConsequence } from '../group-hub-labels';

interface AddMemberFormInput {
  groupId: number;
  open: boolean;
  onAdded: (personId: number) => void;
}

export interface AddMemberFormControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  joinedOn: string | null;
  setJoinedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  canSubmit: boolean;
  submit: () => void;
}

export const useAddMemberForm = ({
  groupId,
  open,
  onAdded,
}: AddMemberFormInput): AddMemberFormControl => {
  const today = toIsoDay(new Date());
  const [person, setPerson] = useState<PersonRef | null>(null);
  const [joinedOn, setJoinedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useAddGroupMembershipMutation(groupId);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
      setJoinedOn(today);
      setRejection(null);
    }
  }

  const personName = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const canSubmit = person !== null && joinedOn !== null && !mutation.isPending;

  const submit = (): void => {
    if (person === null || joinedOn === null) {
      return;
    }

    const added = (): void => {
      onAdded(person.personId);
    };

    setRejection(null);
    mutation.mutate(
      { personId: person.personId, personName, joinedOn },
      {
        onSuccess: added,
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
    joinedOn,
    setJoinedOn,
    consequence:
      person === null || joinedOn === null ? null : toJoinConsequence(personName, joinedOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit,
    submit,
  };
};
