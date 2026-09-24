import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { useMeQuery } from '@/features/session';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddGroupAdminMutation, useEndGroupAdminMutation } from '../api';
import {
  toAdminEndConsequence,
  toAdminEndParagraph,
  toAdminFunction,
  toAppointConsequence,
} from '../group-hub-labels';
import { GroupAdminAppointFormSchema, GroupAdminEndFormSchema } from '../schemas';

const APPOINT_LABEL = 'Gruppen-Admin ernennen';
const END_LABEL = 'Gruppen-Admin beenden';

interface GroupAdminEditorInput {
  groupId: number;
  groupName: string;
  admin: GroupDetailAdmin | null;
  runningAdmins: number;
  prefillPerson: PersonRef | null;
}

export interface GroupAdminEditorControl {
  isEditing: boolean;
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
  functionLabel: string;
  setFunctionLabel: (value: string) => void;
  sinceOn: string | null;
  setSinceOn: (value: string | null) => void;
  sinceOnError: string | undefined;
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

export const useGroupAdminEditor = ({
  groupId,
  groupName,
  admin,
  runningAdmins,
  prefillPerson,
}: GroupAdminEditorInput): GroupAdminEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = admin !== null;
  const me = useMeQuery();
  const isSelf = admin !== null && admin.personId === me.data?.person.id;
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddGroupAdminMutation(groupId);
  const endMutation = useEndGroupAdminMutation(groupId);
  const navigate = useNavigate();

  const appointForm = useForm({
    resolver: zodResolver(GroupAdminAppointFormSchema),
    defaultValues: { person: prefillPerson, functionLabel: '', sinceOn: today },
    mode: 'onTouched',
  });
  const endForm = useForm({
    resolver: zodResolver(GroupAdminEndFormSchema),
    defaultValues: { endedOn: today },
    mode: 'onTouched',
  });
  const appointState = appointForm.formState;
  const endState = endForm.formState;
  const { isDirty: isAppointDirty, isValid: isAppointValid } = appointState;
  const { isDirty: isEndDirty, isValid: isEndValid } = endState;
  const personField = useController({ control: appointForm.control, name: 'person' });
  const functionField = useController({ control: appointForm.control, name: 'functionLabel' });
  const sinceOnField = useController({ control: appointForm.control, name: 'sinceOn' });
  const endedOnField = useController({ control: endForm.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = toPersonName(person);
  const adminName = toPersonName(admin);

  const landBack = (adminId: number): void => {
    void navigate({
      to: '/groups/$groupId',
      params: { groupId: String(groupId) },
      search: (previous) => ({ ...previous, changed: toLandingKey('admin', adminId) }),
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

  const submitAppoint = appointForm.handleSubmit((values) => {
    setRejection(null);
    addMutation.mutate(
      {
        personId: values.person.personId,
        personName: toPersonName(values.person),
        function: toAdminFunction(values.functionLabel),
        sinceOn: values.sinceOn,
      },
      { onSuccess: (added) => landBack(added.groupAdminId), onError: fail },
    );
  });

  const submitEnd = endForm.handleSubmit((values) => {
    if (admin === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      {
        groupAdminId: admin.groupAdminId,
        personName: adminName,
        groupName,
        isSelf,
        endedOn: values.endedOn,
      },
      { onSuccess: () => landBack(admin.groupAdminId), onError: fail },
    );
  });

  const appointConsequence =
    person === null || sinceOn === null ? null : toAppointConsequence(personName, sinceOn, today);

  const endConsequence = endedOn === null ? null : toAdminEndConsequence(adminName, endedOn, today);

  return {
    isEditing,
    person,
    select,
    clearPerson,
    functionLabel: functionField.field.value,
    setFunctionLabel: functionField.field.onChange,
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: appointState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: endState.errors.endedOn?.message,
    consequence: isEditing
      ? toAdminEndParagraph(endConsequence, isSelf, runningAdmins)
      : appointConsequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? isEndDirty : isAppointDirty,
    canSubmit: isEditing ? isEndValid : isAppointValid,
    actionLabel: isEditing ? END_LABEL : APPOINT_LABEL,
    submit: () => {
      void (isEditing ? submitEnd() : submitAppoint());
    },
  };
};
