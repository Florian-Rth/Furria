import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useArchiveGroupFromHubMutation } from '../api';
import type { GroupHub } from '../schemas';

export interface GroupArchiveControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useGroupArchive = (hub: GroupHub): GroupArchiveControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useArchiveGroupFromHubMutation(hub.groupId);
  const navigate = useNavigate();

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
      { name: hub.name },
      {
        onSuccess: () => {
          setIsOpen(false);
          void navigate({ to: '/groups' });
        },
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { isOpen, open, close, rejection, isSaving: mutation.isPending, submit };
};
