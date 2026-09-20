import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { OfficeNameInput } from '../api';

interface BoardOfficeConfirmInput {
  mutation: UseMutationResult<void, Error, OfficeNameInput>;
  officeName: string;
  onDone: () => void;
}

export interface BoardOfficeConfirmControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useBoardOfficeConfirm = ({
  mutation,
  officeName,
  onDone,
}: BoardOfficeConfirmInput): BoardOfficeConfirmControl => {
  const [rejection, setRejection] = useState<string | null>(null);

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      { officeName },
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
