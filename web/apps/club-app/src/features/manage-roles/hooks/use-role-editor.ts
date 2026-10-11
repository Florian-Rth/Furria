import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { useWriteForm } from '@/features/write';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../api';
import type { RoleForm } from '../schemas';
import { RoleFormSchema } from '../schemas';

const NO_ROLE = 0;

interface RoleEditorInput {
  roleId: number | null;
  initial: RoleForm;
}

export interface RoleEditorControl {
  form: UseFormReturn<RoleForm>;
  description: string;
  setDescription: (value: string) => void;
  touchDescription: () => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useRoleEditor = ({ roleId, initial }: RoleEditorInput): RoleEditorControl => {
  const create = useCreateRoleMutation();
  const update = useUpdateRoleMutation(roleId ?? NO_ROLE);

  const write = useWriteForm({
    schema: RoleFormSchema,
    defaults: initial,
    mutate: (values) =>
      roleId === null
        ? create.mutateAsync(values).then((created) => created.roleId)
        : update.mutateAsync(values).then(() => roleId),
    landing: (id) => ({ to: '/manage/roles', search: { role: id }, mark: { kind: 'role', id } }),
  });
  const description = useController({ control: write.form.control, name: 'description' });

  return {
    ...write,
    description: description.field.value,
    setDescription: description.field.onChange,
    touchDescription: description.field.onBlur,
  };
};
