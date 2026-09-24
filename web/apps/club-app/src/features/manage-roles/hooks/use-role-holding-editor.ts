import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useAddRoleHoldingMutation, useEndRoleHoldingMutation } from '../api';
import {
  toEndHoldingConsequence,
  toHoldingConsequence,
  toPersonName,
} from '../manage-roles-labels';
import type { RoleHolder } from '../schemas';
import { RoleHoldingAddFormSchema, RoleHoldingEndFormSchema } from '../schemas';

const END_LABEL = 'Inhaberschaft beenden';
const ADD_LABEL = 'Inhaberschaft eintragen';

interface RoleHoldingEditorInput {
  roleId: number;
  roleName: string;
  holder: RoleHolder | null;
  prefillPerson: PersonRef | null;
}

export interface RoleHoldingEditorControl {
  person: PersonRef | null;
  select: (person: PersonRef) => void;
  clearPerson: () => void;
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

export const useRoleHoldingEditor = ({
  roleId,
  roleName,
  holder,
  prefillPerson,
}: RoleHoldingEditorInput): RoleHoldingEditorControl => {
  const today = toIsoDay(new Date());
  const isEditing = holder !== null;
  const [rejection, setRejection] = useState<string | null>(null);

  const addMutation = useAddRoleHoldingMutation(roleId, roleName);
  const endMutation = useEndRoleHoldingMutation(roleId);
  const navigate = useNavigate();

  const addForm = useForm({
    resolver: zodResolver(RoleHoldingAddFormSchema),
    defaultValues: { person: prefillPerson, sinceOn: today },
    mode: 'onTouched',
  });
  const endForm = useForm({
    resolver: zodResolver(RoleHoldingEndFormSchema),
    defaultValues: { endedOn: today },
    mode: 'onTouched',
  });
  const addState = addForm.formState;
  const endState = endForm.formState;
  const { isDirty: isAddDirty, isValid: isAddValid } = addState;
  const { isDirty: isEndDirty, isValid: isEndValid } = endState;
  const personField = useController({ control: addForm.control, name: 'person' });
  const sinceOnField = useController({ control: addForm.control, name: 'sinceOn' });
  const endedOnField = useController({ control: endForm.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);
  const holderName = holder === null ? '' : toPersonName(holder);

  const landBack = (roleHoldingId: number): void => {
    void navigate({
      to: '/manage/roles',
      search: (previous) => ({
        ...previous,
        role: roleId,
        changed: toLandingKey('role-holding', roleHoldingId),
      }),
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

  const submitAdd = addForm.handleSubmit((values) => {
    setRejection(null);
    addMutation.mutate(
      {
        personId: values.person.personId,
        personName: toPersonName(values.person),
        sinceOn: values.sinceOn,
      },
      { onSuccess: (added) => landBack(added.roleHoldingId), onError: fail },
    );
  });

  const submitEnd = endForm.handleSubmit((values) => {
    if (holder === null) {
      return;
    }

    setRejection(null);
    endMutation.mutate(
      { roleHoldingId: holder.roleHoldingId, personName: holderName, endedOn: values.endedOn },
      { onSuccess: () => landBack(holder.roleHoldingId), onError: fail },
    );
  });

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndHoldingConsequence(holderName, roleName, endedOn, today)
    : person === null || sinceOn === null
      ? null
      : toHoldingConsequence(personName, roleName, sinceOn, today);

  return {
    person,
    select,
    clearPerson,
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: addState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: endState.errors.endedOn?.message,
    consequence,
    rejection,
    isSaving: isEditing ? endMutation.isPending : addMutation.isPending,
    isDirty: isEditing ? isEndDirty : isAddDirty,
    canSubmit: isEditing ? isEndValid : isAddValid,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: () => {
      void (isEditing ? submitEnd() : submitAdd());
    },
  };
};
