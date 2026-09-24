import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
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
import { GroupMembershipEndFormSchema, GroupMembershipJoinFormSchema } from '../schemas';

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
  joinedOnError: string | undefined;
  makeAdmin: boolean;
  setMakeAdmin: (value: boolean) => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  endedOn: string | null;
  setEndedOn: (value: string | null) => void;
  endedOnError: string | undefined;
  consequence: string | null;
  rejection: string | null;
  isSaving: boolean;
  isDirty: boolean;
  canSubmit: boolean;
  actionLabel: string;
  submit: () => void;
}

const toPersonName = (person: { firstName: string; lastName: string } | null): string =>
  person === null ? '' : `${person.firstName} ${person.lastName}`;

export const useGroupMembershipEditor = ({
  groupId,
  membership,
  prefillPerson,
}: GroupMembershipEditorInput): GroupMembershipEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = membership !== null;
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddGroupMembershipMutation(groupId);
  const endMutation = useEndGroupMembershipMutation(groupId);
  const navigate = useNavigate();

  const joinForm = useForm({
    resolver: zodResolver(GroupMembershipJoinFormSchema),
    defaultValues: { person: prefillPerson, joinedOn: today, makeAdmin: false, functionLabel: '' },
    mode: 'onTouched',
  });
  const endForm = useForm({
    resolver: zodResolver(GroupMembershipEndFormSchema),
    defaultValues: { endedOn: today },
    mode: 'onTouched',
  });
  const joinState = joinForm.formState;
  const endState = endForm.formState;
  const { isDirty: isJoinDirty, isValid: isJoinValid } = joinState;
  const { isDirty: isEndDirty, isValid: isEndValid } = endState;
  const personField = useController({ control: joinForm.control, name: 'person' });
  const joinedOnField = useController({ control: joinForm.control, name: 'joinedOn' });
  const makeAdminField = useController({ control: joinForm.control, name: 'makeAdmin' });
  const functionField = useController({ control: joinForm.control, name: 'functionLabel' });
  const endedOnField = useController({ control: endForm.control, name: 'endedOn' });

  const person = personField.field.value;
  const joinedOn = joinedOnField.field.value;
  const makeAdmin = makeAdminField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = toPersonName(person);
  const memberName = toPersonName(membership);

  const landBack = (membershipId: number): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(groupId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('membership', membershipId) }),
      replace: true,
    });
  };

  const fail = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const clearPerson = (): void => {
    personField.field.onChange(null);
    setRejection(null);
  };

  const select = (next: PersonRef): void => {
    personField.field.onChange(next);
    setRejection(null);
  };

  const submitJoin = joinForm.handleSubmit((values) => {
    setRejection(null);
    addMutation.mutate(
      {
        personId: values.person.personId,
        personName: toPersonName(values.person),
        joinedOn: values.joinedOn,
        admin: values.makeAdmin ? { function: toAdminFunction(values.functionLabel) } : null,
      },
      { onSuccess: (added) => landBack(added.groupMembershipId), onError: fail },
    );
  });

  const submitEnd = endForm.handleSubmit((values) => {
    if (membership === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      {
        groupMembershipId: membership.groupMembershipId,
        personName: memberName,
        endedOn: values.endedOn,
      },
      { onSuccess: () => landBack(membership.groupMembershipId), onError: fail },
    );
  });

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
    setJoinedOn: joinedOnField.field.onChange,
    joinedOnError: joinState.errors.joinedOn?.message,
    makeAdmin,
    setMakeAdmin: makeAdminField.field.onChange,
    functionLabel: functionField.field.value,
    setFunctionLabel: functionField.field.onChange,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: endState.errors.endedOn?.message,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? isEndDirty : isJoinDirty,
    canSubmit: isEditing ? isEndValid : isJoinValid,
    actionLabel: isEditing ? END_LABEL : JOIN_LABEL,
    submit: () => {
      void (isEditing ? submitEnd() : submitJoin());
    },
  };
};
