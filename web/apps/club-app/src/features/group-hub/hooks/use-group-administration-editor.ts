import type { UseFormRegisterReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { toGroupKindValue } from '@/features/group-kinds';
import { useWriteForm } from '@/features/write';
import { useUpdateGroupAdministrationMutation } from '../api';
import type { GroupHub } from '../schemas';
import { GroupAdministrationFormSchema } from '../schemas';

export interface GroupAdministrationEditorControl {
  name: UseFormRegisterReturn<'name'>;
  nameError: string | undefined;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupAdministrationEditor = (hub: GroupHub): GroupAdministrationEditorControl => {
  const mutation = useUpdateGroupAdministrationMutation(hub.groupId);

  const write = useWriteForm({
    schema: GroupAdministrationFormSchema,
    defaults: { name: hub.name, groupKindId: toGroupKindValue(hub.groupKindId) },
    mutate: (values) => mutation.mutateAsync(values),
    landing: () => ({
      to: '/groups/$groupId',
      params: { groupId: hub.groupId },
      mark: { kind: 'group-administration', id: hub.groupId },
    }),
  });
  const groupKindId = useController({ control: write.form.control, name: 'groupKindId' });

  return {
    name: write.form.register('name'),
    nameError: write.form.formState.errors.name?.message,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    isDirty: write.isDirty,
    canSubmit: write.canSubmit,
    isSaving: write.isSaving,
    rejection: write.rejection,
    submit: write.submit,
  };
};
