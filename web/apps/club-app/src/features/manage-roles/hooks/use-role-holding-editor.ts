import { useController } from 'react-hook-form';
import type { WriteLanding } from '@/features/write';
import { useWriteForm } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
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
  const holderName = holder === null ? '' : toPersonName(holder);

  const addMutation = useAddRoleHoldingMutation(roleId, roleName);
  const endMutation = useEndRoleHoldingMutation(roleId);

  const toRoleLanding = (roleHoldingId: number): WriteLanding => ({
    to: '/manage/roles',
    search: { role: roleId },
    mark: { kind: 'role-holding', id: roleHoldingId },
  });

  const adding = useWriteForm({
    schema: RoleHoldingAddFormSchema,
    defaults: { person: prefillPerson, sinceOn: today },
    mutate: (values) =>
      addMutation
        .mutateAsync({
          personId: values.person.personId,
          personName: toPersonName(values.person),
          sinceOn: values.sinceOn,
        })
        .then((added) => added.roleHoldingId),
    landing: toRoleLanding,
  });
  const ending = useWriteForm({
    schema: RoleHoldingEndFormSchema,
    defaults: { endedOn: today },
    mutate: (values) =>
      holder === null
        ? null
        : endMutation
            .mutateAsync({
              roleHoldingId: holder.roleHoldingId,
              personName: holderName,
              endedOn: values.endedOn,
            })
            .then(() => holder.roleHoldingId),
    landing: toRoleLanding,
  });
  const personField = useController({ control: adding.form.control, name: 'person' });
  const sinceOnField = useController({ control: adding.form.control, name: 'sinceOn' });
  const endedOnField = useController({ control: ending.form.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = person === null ? '' : toPersonName(person);
  const write = isEditing ? ending : adding;

  const consequence = isEditing
    ? endedOn === null
      ? null
      : toEndHoldingConsequence(holderName, roleName, endedOn, today)
    : person === null || sinceOn === null
      ? null
      : toHoldingConsequence(personName, roleName, sinceOn, today);

  return {
    person,
    select: personField.field.onChange,
    clearPerson: () => {
      personField.field.onChange(null);
    },
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: adding.form.formState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: ending.form.formState.errors.endedOn?.message,
    consequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: isEditing ? END_LABEL : ADD_LABEL,
    submit: write.submit,
  };
};
