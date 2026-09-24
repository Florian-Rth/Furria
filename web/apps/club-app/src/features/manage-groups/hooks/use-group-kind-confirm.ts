import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { GroupKindNameInput } from '../api';

interface GroupKindConfirmInput {
  mutation: UseMutationResult<void, Error, GroupKindNameInput>;
  kindName: string;
  onDone: () => void;
}

export interface GroupKindConfirmControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useGroupKindConfirm = ({
  mutation,
  kindName,
  onDone,
}: GroupKindConfirmInput): GroupKindConfirmControl => {
  const [rejection, setRejection] = useState<string | null>(null);

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      { kindName },
      {
        onSuccess: onDone,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { rejection, isSaving: mutation.isPending, submit };
};
