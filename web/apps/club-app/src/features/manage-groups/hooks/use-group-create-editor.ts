import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
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
  });

  const setGroupKindId = (value: string): void => {
    form.setValue('groupKindId', value, { shouldDirty: true });
  };

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
    groupKindId: form.watch('groupKindId'),
    setGroupKindId,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
