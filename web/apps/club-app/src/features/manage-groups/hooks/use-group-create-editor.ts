import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateGroupMutation } from '../api';
import type { GroupForm } from '../schemas';
import { GroupFormSchema } from '../schemas';

const FIELD_NAMES = ['name', 'groupKindId'] as const;

const EMPTY_VALUES: GroupForm = { name: '', groupKindId: '' };

export interface GroupCreateEditorControl {
  form: UseFormReturn<GroupForm>;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupCreateEditor = (): GroupCreateEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useCreateGroupMutation();
  const navigate = useNavigate();

  const form = useForm<GroupForm>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;
  const groupKindId = useController({ control: form.control, name: 'groupKindId' });

  const handleSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(values, {
      onSuccess: (created) => {
        void navigate({
          to: '/manage/groups',
          search: (previous) => ({
            ...previous,
            changed: toLandingKey('group', created.groupId),
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
    form,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    isDirty,
    canSubmit: isValid,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
