import { useKkNotice } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useRefreshAfter } from '@/lib/query/use-refresh-after';
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
  const refreshAfter = useRefreshAfter();

  const landOnSecurity = async (): Promise<void> => {
    raiseNotice({ tone: 'success', message: PASSKEY_REMOVED_MESSAGE });
    await navigate({ to: SECURITY_PATH, replace: true });
    await refreshAfter(['account']);
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
