import { useState } from 'react';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupMembershipMutation } from '../api';
import { toAdminFunction, toJoinAsAdminConsequence, toJoinConsequence } from '../group-hub-labels';

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
  makeAdmin: boolean;
  setMakeAdmin: (value: boolean) => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
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
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [functionLabel, setFunctionLabel] = useState('');
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const mutation = useAddGroupMembershipMutation(groupId);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setPerson(null);
      setJoinedOn(today);
      setMakeAdmin(false);
      setFunctionLabel('');
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
      {
        personId: person.personId,
        personName,
        joinedOn,
        admin: makeAdmin ? { function: toAdminFunction(functionLabel) } : null,
      },
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

  const describeJoin = makeAdmin ? toJoinAsAdminConsequence : toJoinConsequence;

  return {
    person,
    select,
    clearPerson,
    joinedOn,
    setJoinedOn,
    makeAdmin,
    setMakeAdmin,
    functionLabel,
    setFunctionLabel,
    consequence:
      person === null || joinedOn === null ? null : describeJoin(personName, joinedOn, today),
    rejection,
    isSaving: mutation.isPending,
    canSubmit,
    submit,
  };
};
