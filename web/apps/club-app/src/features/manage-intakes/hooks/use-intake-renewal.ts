import { useState } from 'react';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useRenewIntakeMutation } from '../api';

export interface IntakeRenewalControl {
  isOpen: boolean;
  ask: () => void;
  close: () => void;
  renew: () => void;
  rejection: string | null;
  isSaving: boolean;
}

export const useIntakeRenewal = (
  intakeId: number | null,
  needsConfirmation: boolean,
): IntakeRenewalControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useRenewIntakeMutation();

  const renew = (): void => {
    if (intakeId === null) {
      return;
    }
    setRejection(null);
    void mutation.mutateAsync(intakeId).then(
      () => {
        setIsOpen(false);
      },
      (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      },
    );
  };

  const ask = (): void => {
    if (!needsConfirmation) {
      renew();
      return;
    }
    setRejection(null);
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
  };

  return { isOpen, ask, close, renew, rejection, isSaving: mutation.isPending };
};
