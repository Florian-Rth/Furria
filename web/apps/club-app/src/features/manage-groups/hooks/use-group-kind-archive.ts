import { useState } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useArchiveGroupKindMutation } from '../api';
import type { GroupKindEntry } from '../manage-groups-labels';

export interface GroupKindArchiveControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useGroupKindArchive = (entry: GroupKindEntry): GroupKindArchiveControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useArchiveGroupKindMutation(entry.groupKindId);
  const goBackTo = useGoBackTo();

  const open = (): void => {
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  const submit = (): void => {
    setRejection(null);
    mutation.mutate(
      { kindName: entry.name },
      {
        onSuccess: () => {
          setIsOpen(false);
          void goBackTo({ to: '/manage/groups', ignoreBlocker: true });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
