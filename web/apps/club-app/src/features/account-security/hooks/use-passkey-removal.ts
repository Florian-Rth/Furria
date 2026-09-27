import { useKkNotice } from '@furria/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ME_QUERY_KEY } from '@/features/session';
import { toWriteErrorMessage } from '@/lib/write-error';
import { PASSKEY_REMOVED_MESSAGE, SECURITY_PATH } from '../account-security-labels';
import { usePasskeyRemovalMutation } from '../api';

export interface PasskeyRemovalControl {
  isOpen: boolean;
  isBusy: boolean;
  rejection: string | null;
  open: () => void;
  close: () => void;
  confirm: () => void;
}

export const usePasskeyRemoval = (passkeyId: string): PasskeyRemovalControl => {
  const [isOpen, setIsOpen] = useState(false);
  const [rejection, setRejection] = useState<string | null>(null);
  const mutation = usePasskeyRemovalMutation();
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const queryClient = useQueryClient();

  const landOnSecurity = async (): Promise<void> => {
    raiseNotice({ tone: 'success', message: PASSKEY_REMOVED_MESSAGE });
    await navigate({ to: SECURITY_PATH, replace: true });
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
  };

  const showFailure = (error: Error): void => {
    setRejection(toWriteErrorMessage(error));
  };

  return {
    isOpen,
    isBusy: mutation.isPending,
    rejection,
    open: () => {
      setRejection(null);
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
    confirm: () => {
      setRejection(null);
      mutation.mutate(passkeyId, { onSuccess: landOnSecurity, onError: showFailure });
    },
  };
};
