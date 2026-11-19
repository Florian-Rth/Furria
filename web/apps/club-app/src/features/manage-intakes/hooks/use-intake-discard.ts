import { useState } from 'react';
import { useGoBackTo } from '@/lib/use-go-back-to';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useDiscardIntakeMutation } from '../api';
import { INTAKES_PATH } from '../intake-labels';

export interface IntakeDiscardControl {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: () => void;
  rejection: string | null;
  isSaving: boolean;
}

export const useIntakeDiscard = (intakeId: number): IntakeDiscardControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = useDiscardIntakeMutation();
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
    void mutation.mutateAsync(intakeId).then(
      () => {
        setIsOpen(false);
        void goBackTo({ to: INTAKES_PATH, ignoreBlocker: true });
      },
      (error: Error) => {
        setRejection(toWriteErrorMessage(error));
      },
    );
  };

  return { isOpen, open, close, submit, rejection, isSaving: mutation.isPending };
};
