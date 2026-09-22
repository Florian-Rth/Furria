import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toGroupKindValue } from '@/features/group-kinds';
import { toFormFailures } from '@/lib/api/api-failures';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateGroupMutation, useUpdateGroupMutation } from '../api';
import type { GroupForm, ManagedGroupSummary } from '../schemas';
import { GroupFormSchema } from '../schemas';

const FIELD_NAMES = ['name', 'groupKindId'] as const;

const EMPTY_VALUES: GroupForm = { name: '', groupKindId: '' };

const toValues = (group: ManagedGroupSummary | null): GroupForm =>
  group === null
    ? EMPTY_VALUES
    : {
        name: group.name,
        groupKindId: toGroupKindValue(group.groupKindId),
      };

interface GroupFormInput {
  group: ManagedGroupSummary | null;
  open: boolean;
  onSaved: (groupId: number) => void;
}

export interface GroupFormControl {
  form: UseFormReturn<GroupForm>;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  isEditing: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupForm = ({ group, open, onSaved }: GroupFormInput): GroupFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const createMutation = useCreateGroupMutation();
  const updateMutation = useUpdateGroupMutation();

  const form = useForm<GroupForm>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: toValues(group),
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(toValues(group));
      setRejection(null);
    }
  }

  const showFailure = (error: Error): void => {
    const failures = toFormFailures(error, FIELD_NAMES);

    for (const failure of failures.fields) {
      form.setError(failure.name, { message: failure.message });
    }

    const fallback = failures.fields.length === 0 ? toWriteErrorMessage(error) : null;

    setRejection(failures.footer ?? fallback);
  };

  const handleSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (group === null) {
      createMutation.mutate(values, {
        onSuccess: (created) => {
          onSaved(created.groupId);
        },
        onError: showFailure,
      });
      return;
    }

    updateMutation.mutate(
      { groupId: group.groupId, form: values },
      {
        onSuccess: () => {
          onSaved(group.groupId);
        },
        onError: showFailure,
      },
    );
  });

  const submit = (): void => {
    void handleSubmit();
  };

  const setGroupKindId = (value: string): void => {
    form.setValue('groupKindId', value);
  };

  return {
    form,
    groupKindId: form.watch('groupKindId'),
    setGroupKindId,
    isEditing: group !== null,
    isSaving: createMutation.isPending || updateMutation.isPending,
    rejection,
    submit,
  };
};
