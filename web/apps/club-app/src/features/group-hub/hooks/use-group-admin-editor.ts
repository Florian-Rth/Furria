import { useController } from 'react-hook-form';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { useMeQuery } from '@/features/session';
import type { WriteLanding } from '@/features/write';
import { useWriteForm } from '@/features/write';
import type { PersonRef } from '@/lib/api/schemas';
import { toIsoDay } from '@/lib/day';
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
  const isSelf = admin !== null && admin.personId === me.data?.person?.id;
  const adminName = toPersonName(admin);

  const addMutation = useAddGroupAdminMutation(groupId);
  const endMutation = useEndGroupAdminMutation(groupId);

  const toGroupLanding = (adminId: number): WriteLanding => ({
    to: '/groups/$groupId',
    params: { groupId },
    mark: { kind: 'admin', id: adminId },
  });

  const appointing = useWriteForm({
    schema: GroupAdminAppointFormSchema,
    defaults: { person: prefillPerson, functionLabel: '', sinceOn: today },
    mutate: (values) =>
      addMutation
        .mutateAsync({
          personId: values.person.personId,
          personName: toPersonName(values.person),
          function: toAdminFunction(values.functionLabel),
          sinceOn: values.sinceOn,
        })
        .then((added) => added.groupAdminId),
    landing: toGroupLanding,
  });
  const ending = useWriteForm({
    schema: GroupAdminEndFormSchema,
    defaults: { endedOn: today },
    mutate: (values) =>
      admin === null
        ? null
        : endMutation
            .mutateAsync({
              groupAdminId: admin.groupAdminId,
              personName: adminName,
              groupName,
              isSelf,
              endedOn: values.endedOn,
            })
            .then(() => admin.groupAdminId),
    landing: toGroupLanding,
  });
  const personField = useController({ control: appointing.form.control, name: 'person' });
  const functionField = useController({ control: appointing.form.control, name: 'functionLabel' });
  const sinceOnField = useController({ control: appointing.form.control, name: 'sinceOn' });
  const endedOnField = useController({ control: ending.form.control, name: 'endedOn' });

  const person = personField.field.value;
  const sinceOn = sinceOnField.field.value;
  const endedOn = endedOnField.field.value;
  const personName = toPersonName(person);
  const write = isEditing ? ending : appointing;

  const appointConsequence =
    person === null || sinceOn === null ? null : toAppointConsequence(personName, sinceOn, today);

  const endConsequence = endedOn === null ? null : toAdminEndConsequence(adminName, endedOn, today);

  return {
    isEditing,
    person,
    select: personField.field.onChange,
    clearPerson: () => {
      personField.field.onChange(null);
    },
    functionLabel: functionField.field.value,
    setFunctionLabel: functionField.field.onChange,
    sinceOn,
    setSinceOn: sinceOnField.field.onChange,
    sinceOnError: appointing.form.formState.errors.sinceOn?.message,
    endedOn,
    setEndedOn: endedOnField.field.onChange,
    endedOnError: ending.form.formState.errors.endedOn?.message,
    consequence: isEditing
      ? toAdminEndParagraph(endConsequence, isSelf, runningAdmins)
      : appointConsequence,
    rejection: write.rejection,
    isSaving: write.isSaving,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    actionLabel: isEditing ? END_LABEL : APPOINT_LABEL,
    submit: write.submit,
  };
};
