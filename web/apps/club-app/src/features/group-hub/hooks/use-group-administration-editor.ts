import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toGroupKindValue } from '@/features/group-kinds';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateGroupAdministrationMutation } from '../api';
import type { GroupHub } from '../schemas';
import { GroupAdministrationFormSchema } from '../schemas';

const FIELD_NAMES = ['name', 'groupKindId'] as const;

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
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateGroupAdministrationMutation(hub.groupId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(GroupAdministrationFormSchema),
    defaultValues: { name: hub.name, groupKindId: toGroupKindValue(hub.groupKindId) },
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const groupKindId = useController({ control: form.control, name: 'groupKindId' });

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(values, {
      onSuccess: () => {
        void navigate({
          to: '/groups/$groupId',
          params: { groupId: String(hub.groupId) },
          search: (previous) => ({
            ...previous,
            changed: toLandingKey('group-administration', hub.groupId),
          }),
          replace: true,
        });
      },
      onError: (error) => {
        const failures = toFormFailures(error, FIELD_NAMES);

        for (const failure of failures.fields) {
          form.setError(failure.name, { message: failure.message });
        }

        setRejection(
          failures.footer ?? (failures.fields.length === 0 ? toWriteErrorMessage(error) : null),
        );
      },
    });
  });

  return {
    name: form.register('name'),
    nameError: errors.name?.message,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    isDirty,
    canSubmit: isValid,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
