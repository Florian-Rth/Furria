import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import type { GroupMutationInput } from '../api';
import { toWriteErrorMessage } from '../manage-groups-messages';
import type { ManagedGroupSummary } from '../schemas';

interface GroupConfirmInput {
  mutation: UseMutationResult<void, Error, GroupMutationInput>;
  group: ManagedGroupSummary | null;
  open: boolean;
  onDone: () => void;
}

export interface GroupConfirmControl {
  rejection: string | null;
  isSaving: boolean;
  submit: () => void;
}

export const useGroupConfirm = ({
  mutation,
  group,
  open,
  onDone,
}: GroupConfirmInput): GroupConfirmControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  if (wasOpen !== open) {
    setWasOpen(open);

    if (open) {
      setRejection(null);
    }
  }

  const submit = (): void => {
    if (group === null) {
      return;
    }

    setRejection(null);
    mutation.mutate(
      { groupId: group.groupId, name: group.name },
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
