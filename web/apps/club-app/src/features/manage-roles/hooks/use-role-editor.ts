import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../api';
import { toRoleFieldErrors } from '../role-form-errors';
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
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateRoleMutation();
  const update = useUpdateRoleMutation(roleId ?? NO_ROLE);
  const navigate = useNavigate();

  const form = useForm<RoleForm>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: initial,
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const description = useController({ control: form.control, name: 'description' });

  const landBack = (id: number): void => {
    void navigate({
      to: '/manage/roles',
      search: (previous) => ({ ...previous, role: id, changed: toLandingKey('role', id) }),
      replace: true,
    });
  };

  const reject = (error: Error): void => {
    const fieldErrors = toRoleFieldErrors(error);

    for (const fieldError of fieldErrors) {
      form.setError(fieldError.field, { message: fieldError.message });
    }
    setRejection(fieldErrors.length === 0 ? toWriteErrorMessage(error) : null);
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (roleId === null) {
      create.mutate(values, {
        onSuccess: (created) => {
          landBack(created.roleId);
        },
        onError: reject,
      });

      return;
    }

    update.mutate(values, {
      onSuccess: () => {
        landBack(roleId);
      },
      onError: reject,
    });
  });

  return {
    form,
    description: description.field.value,
    setDescription: description.field.onChange,
    touchDescription: description.field.onBlur,
    isDirty,
    canSubmit: isValid,
    isSaving: create.isPending || update.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
