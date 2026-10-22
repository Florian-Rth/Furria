import { useController } from 'react-hook-form';
import type { GroupDetailMember } from '@/features/group-detail/schemas';
import { useWriteForm } from '@/features/write/hooks/use-write-form';
import type { WriteLanding } from '@/features/write/landing-target';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
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
  const memberName = toPersonName(membership);

  const addMutation = useAddGroupMembershipMutation(groupId);
  const endMutation = useEndGroupMembershipMutation(groupId);

  const toGroupLanding = (membershipId: number): WriteLanding => ({
    to: '/groups/$groupId',
    params: { groupId },
    mark: { kind: 'membership', id: membershipId },
  });

  const joining = useWriteForm({
    schema: GroupMembershipJoinFormSchema,
    defaults: { person: prefillPerson, joinedOn: today, makeAdmin: false, functionLabel: '' },
    mutate: (values) =>
      addMutation
        .mutateAsync({
          personId: values.person.personId,
          personName: toPersonName(values.person),
          joinedOn: values.joinedOn,
          admin: values.makeAdmin ? { function: toAdminFunction(values.functionLabel) } : null,
        })
        .then((added) => added.groupMembershipId),
    landing: toGroupLanding,
  });
  const ending = useWriteForm({
    schema: GroupMembershipEndFormSchema,
    defaults: { endedOn: today },
    mutate: (values) =>
      membership === null
        ? null
        : endMutation
            .mutateAsync({
              groupMembershipId: membership.groupMembershipId,
              personName: memberName,
              endedOn: values.endedOn,
            })
            .then(() => membership.groupMembershipId),
    landing: toGroupLanding,
  });
  const personField = useController({ control: joining.form.control, name: 'person' });
  const joinedOnField = useController({ control: joining.form.control, name: 'joinedOn' });
  const makeAdminField = useController({ control: joining.form.control, name: 'makeAdmin' });
  const functionField = useController({ control: joining.form.control, name: 'functionLabel' });
  const endedOnField = useController({ control: ending.form.control, name: 'endedOn' });

  const person = personField.field.value;
  const joinedOn = joinedOnField.field.value;
  const makeAdmin = makeAdminField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = toPersonName(person);
  const write = isEditing ? ending : joining;

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
    select: personField.field.onChange,
    clearPerson: () => {
      personField.field.onChange(null);
    },
    joinedOn,
    setJoinedOn: joinedOnField.field.onChange,
    joinedOnError: joining.form.formState.errors.joinedOn?.message,
    makeAdmin,
    setMakeAdmin: makeAdminField.field.onChange,
    functionLabel: functionField.field.value,
    setFunctionLabel: functionField.field.onChange,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: ending.form.formState.errors.endedOn?.message,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: isEditing ? END_LABEL : JOIN_LABEL,
    submit: write.submit,
  };
};
