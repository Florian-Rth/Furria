import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateGroupKindMutation, useUpdateGroupKindMutation } from '../api';
import type { GroupKindEntry } from '../manage-groups-labels';
import type { GroupKindForm } from '../schemas';
import { GroupKindFormSchema } from '../schemas';

const FIELD_NAMES = ['name'] as const;

export interface GroupKindEditorControl {
  form: UseFormReturn<GroupKindForm>;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupKindEditor = (entry: GroupKindEntry | null): GroupKindEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateGroupKindMutation();
  const update = useUpdateGroupKindMutation();
  const navigate = useNavigate();

  const form = useForm<GroupKindForm>({
    resolver: zodResolver(GroupKindFormSchema),
    defaultValues: { name: entry?.name ?? '' },
  });

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    setRejection(
      failures.footer ?? (failures.fields.length === 0 ? toWriteErrorMessage(error) : null),
    );
  };

  const handleSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (entry === null) {
      create.mutate(values, {
        onSuccess: (created) => {
          void navigate({
            to: '/manage/groups',
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-kind', created.groupKindId),
            }),
            replace: true,
          });
        },
        onError: showFailure,
      });
      return;
    }

    update.mutate(
      { groupKindId: entry.groupKindId, form: values },
      {
        onSuccess: () => {
          void navigate({
            to: '/manage/groups/kinds/$groupKindId',
            params: { groupKindId: String(entry.groupKindId) },
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-kind', entry.groupKindId),
            }),
            replace: true,
          });
        },
        onError: showFailure,
      },
    );
  });

  return {
    form,
    isSaving: create.isPending || update.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
