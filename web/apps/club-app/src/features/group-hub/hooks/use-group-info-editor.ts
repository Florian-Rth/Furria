import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { toLandingKey } from '@/features/write';
import type { GroupTone } from '@/lib/group-tone';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUpdateGroupInfoMutation } from '../api';
import { toGroupInfoFormValues } from '../group-hub-labels';
import type { GroupHub } from '../schemas';
import { GroupInfoFormSchema } from '../schemas';

type GroupToneChoice = GroupTone | '';

export interface GroupInfoEditorControl {
  description: string;
  setDescription: (value: string) => void;
  groupKindId: string;
  setGroupKindId: (value: string) => void;
  foundedYear: UseFormRegisterReturn<'foundedYear'>;
  tone: GroupToneChoice;
  setTone: (value: GroupToneChoice) => void;
  foundedYearError: string | undefined;
  isDirty: boolean;
  canSubmit: boolean;
  isSaving: boolean;
  rejection: string | null;
  submit: () => void;
}

export const useGroupInfoEditor = (hub: GroupHub): GroupInfoEditorControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useUpdateGroupInfoMutation(hub.groupId);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(GroupInfoFormSchema),
    defaultValues: toGroupInfoFormValues(hub),
    mode: 'onTouched',
  });
  const { isDirty, isValid, errors } = form.formState;
  const description = useController({ control: form.control, name: 'description' });
  const groupKindId = useController({ control: form.control, name: 'groupKindId' });
  const tone = useController({ control: form.control, name: 'tone' });

  const handleFormSubmit = form.handleSubmit((values) => {
    setRejection(null);
    mutation.mutate(
      { ...values, isRecruiting: hub.isRecruiting },
      {
        onSuccess: () => {
          void navigate({
            to: '/groups/$groupId',
            params: { groupId: String(hub.groupId) },
            search: (previous) => ({
              ...previous,
              changed: toLandingKey('group-info', hub.groupId),
            }),
            replace: true,
          });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  });

  return {
    description: description.field.value,
    setDescription: description.field.onChange,
    groupKindId: groupKindId.field.value,
    setGroupKindId: groupKindId.field.onChange,
    foundedYear: form.register('foundedYear'),
    tone: tone.field.value,
    setTone: tone.field.onChange,
    foundedYearError: errors.foundedYear?.message,
    isDirty,
    canSubmit: isValid,
    isSaving: mutation.isPending,
    rejection,
    submit: () => {
      void handleFormSubmit();
    },
  };
};
