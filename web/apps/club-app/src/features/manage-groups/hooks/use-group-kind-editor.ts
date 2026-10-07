import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import { toFormFailures } from '@/lib/api/api-failures';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateGroupKindMutation, useUpdateGroupKindMutation } from '../api';
import type { GroupKindEntry } from '../manage-groups-labels';
import type { GroupKindForm } from '../schemas';
import { GroupKindFormSchema } from '../schemas';

const FIELD_NAMES = ['name'] as const;

export interface GroupKindEditorControl {
  form: UseFormReturn<GroupKindForm>;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupKindEditor = (entry: GroupKindEntry | null): GroupKindEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const create = useCreateGroupKindMutation();
  const update = useUpdateGroupKindMutation();
  const goBackTo = useGoBackTo();

  const form = useForm<GroupKindForm>({
    resolver: zodResolver(GroupKindFormSchema),
    defaultValues: { name: entry?.name ?? '' },
    mode: 'onTouched',
  });
  const { isDirty, isValid } = form.formState;

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
          void goBackTo({
            to: '/manage/groups',
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-kind', created.groupKindId),
            }),
            ignoreBlocker: true,
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
          void goBackTo({
            to: '/manage/groups/kinds/$groupKindId',
            params: { groupKindId: String(entry.groupKindId) },
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-kind', entry.groupKindId),
            }),
            ignoreBlocker: true,
          });
        },
        onError: showFailure,
      },
    );
  });

  return {
    form,
    isDirty,
    canSubmit: isValid,
    isSaving: create.isPending || update.isPending,
    rejection,
    submit: () => {
      void handleSubmit();
    },
  };
};
