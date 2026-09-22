import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupMembershipMutation, useEndGroupMembershipMutation } from '../api';
import {
  toAdminFunction,
  toEndConsequence,
  toJoinAsAdminConsequence,
  toJoinConsequence,
} from '../group-hub-labels';

const JOIN_LABEL = 'Mitglied aufnehmen';
const END_LABEL = 'Zugehörigkeit beenden';

interface GroupMembershipEditorInput {
  groupId: number;
  membership: GroupDetailMember | null;
  prefillPerson: PersonRef | null;
}

export interface GroupMembershipEditorControl {
  isEditing: boolean;
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  joinedOn: string | null;
  setJoinedOn: (value: string | null) => void;
  makeAdmin: boolean;
  setMakeAdmin: (value: boolean) => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  actionLabel: string;
  submit: () => void;
}

export const useGroupMembershipEditor = ({
  groupId,
  membership,
  prefillPerson,
}: GroupMembershipEditorInput): GroupMembershipEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = membership !== null;

  const [person, setPerson] = useState<PersonRef | null>(prefillPerson);
  const [joinedOn, setJoinedOn] = useState<string | null>(today);
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [functionLabel, setFunctionLabel] = useState('');
  const [endedOn, setEndedOn] = useState<string | null>(today);
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddGroupMembershipMutation(groupId);
  const endMutation = useEndGroupMembershipMutation(groupId);
  const navigate = useNavigate();

  const personName = person === null ? '' : `${person.firstName} ${person.lastName}`;
  const memberName = membership === null ? '' : `${membership.firstName} ${membership.lastName}`;

  const landBack = (membershipId: number): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(groupId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('membership', membershipId) }),
      replace: true,
    });
  };

  const clearPerson = (): void => {
    setPerson(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    setPerson(next);
    setRejection(null);
  };

  const submitJoin = (): void => {
    if (person === null || joinedOn === null) {
      return;
    }

    setRejection(null);
    addMutation.mutate(
      {
        personId: person.personId,
        personName,
        joinedOn,
        admin: makeAdmin ? { function: toAdminFunction(functionLabel) } : null,
      },
      {
        onSuccess: (added) => {
          landBack(added.groupMembershipId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const submitEnd = (): void => {
    if (membership === null || endedOn === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { groupMembershipId: membership.groupMembershipId, personName: memberName, endedOn },
      {
        onSuccess: () => {
          landBack(membership.groupMembershipId);
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  const describeJoin = makeAdmin ? toJoinAsAdminConsequence : toJoinConsequence;

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndConsequence(memberName, endedOn, today)
    : person === null || joinedOn === null
      ? null
      : describeJoin(personName, joinedOn, today);

  return {
    isEditing,
    person,
    select,
    clearPerson,
    joinedOn,
    setJoinedOn,
    makeAdmin,
    setMakeAdmin,
    functionLabel,
    setFunctionLabel,
    endedOn,
    setEndedOn,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? endedOn !== today : person !== null,
    actionLabel: isEditing ? END_LABEL : JOIN_LABEL,
    submit: isEditing ? submitEnd : submitJoin,
  };
};
