import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useArchiveBoardOfficeMutation } from '../api';

interface BoardOfficeLifecycleInput {
  boardOfficeId: number;
  officeName: string;
  onArchived: () => void;
}

export interface BoardOfficeLifecycleControl {
  archive: () => void;
  isArchiving: boolean;
  rejection: string | null;
}

export const useBoardOfficeLifecycle = ({
  boardOfficeId,
  officeName,
  onArchived,
}: BoardOfficeLifecycleInput): BoardOfficeLifecycleControl => {
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useArchiveBoardOfficeMutation(boardOfficeId);

  const archive = (): void => {
    setRejection(null);
    mutation.mutate(
      { officeName },
      {
        onSuccess: onArchived,
        onError: (error) => {
          setRejection(toWriteErrorMessage(error));
        },
      },
    );
  };

  return { archive, isArchiving: mutation.isPending, rejection };
};
