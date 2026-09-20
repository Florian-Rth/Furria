import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useCreateGroupKindMutation, useUpdateGroupKindMutation } from '../api';
import type { GroupKindForm } from '../schemas';
import { GroupKindFormSchema } from '../schemas';

interface GroupKindFormInput {
  groupKindId: number | null;
  open: boolean;
  initial: GroupKindForm;
  onSaved: () => void;
}

export interface GroupKindFormControl {
  form: UseFormReturn<GroupKindForm>;
  submit: () => void;
  isSaving: boolean;
  rejection: string | null;
}

export const useGroupKindForm = ({
  groupKindId,
  open,
  initial,
  onSaved,
}: GroupKindFormInput): GroupKindFormControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  const create = useCreateGroupKindMutation();
  const update = useUpdateGroupKindMutation();

  const form = useForm<GroupKindForm>({
    resolver: zodResolver(GroupKindFormSchema),
    defaultValues: initial,
  });

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      form.reset(initial);
      setRejection(null);
    }
  }

  const reject = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);

    if (groupKindId === null) {
      create.mutate(values, { onSuccess: onSaved, onError: reject });

      return;
    }

    update.mutate({ groupKindId, form: values }, { onSuccess: onSaved, onError: reject });
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
