import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateRoleMutation, useUpdateRoleMutation } from '../api';
import { toRoleFieldErrors } from '../role-form-errors';
import type { RoleForm } from '../schemas';
import { RoleFormSchema } from '../schemas';

const NO_ROLE = 0;

interface RoleFormInput {
  roleId: number | null;
  open: boolean;
  initial: RoleForm;
  onSaved: (roleId: number | null) => void;
}

export interface RoleFormControl {
  form: UseFormReturn<RoleForm>;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export const useRoleForm = ({ roleId, open, initial, onSaved }: RoleFormInput): RoleFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const create = useCreateRoleMutation();
  const update = useUpdateRoleMutation(roleId ?? NO_ROLE);

  const form = useForm<RoleForm>({ resolver: zodResolver(RoleFormSchema), defaultValues: initial });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(initial);
      setRejection(null);
    }
  }

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
          onSaved(created.roleId);
        },
        onError: reject,
      });

      return;
    }

    update.mutate(values, {
      onSuccess: () => {
        onSaved(null);
      },
      onError: reject,
    });
  });

  return {
    form,
    submit: () => {
      void handleFormSubmit();
    },
    isSaving: create.isPending || update.isPending,
    rejection,
  };
};
