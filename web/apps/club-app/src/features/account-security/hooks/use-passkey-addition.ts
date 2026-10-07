import { useKkNotice } from '@furria/ui';
import { useState } from 'react';
import { toLandingKey } from '@/features/write';
import type { MePasskey } from '@/lib/api/schemas';
import { toPasskeyErrorMessage } from '@/lib/passkey/passkey-messages';
import { usePasskeySupport } from '@/lib/passkey/use-passkey-support';
import { useGoBackTo } from '@/lib/use-go-back-to';
import {
  PASSKEY_ADDED_MESSAGE,
  PASSKEY_LANDING_KIND,
  SECURITY_PATH,
} from '../account-security-labels';
import { useAddPasskeyMutation } from '../api';

export interface PasskeyAdditionControl {
  isAvailable: boolean;
  isAdding: boolean;
  rejection: string | null;
  add: () => void;
}

export const usePasskeyAddition = (): PasskeyAdditionControl => {
  const isAvailable = usePasskeySupport();
  const mutation = useAddPasskeyMutation();
  const goBackTo = useGoBackTo();
  const raiseNotice = useKkNotice();
  const [rejection, setRejection] = useState<string | null>(null);

  const landOnPasskey = (passkey: MePasskey): void => {
    raiseNotice({ tone: 'success', message: PASSKEY_ADDED_MESSAGE });
    void goBackTo({
      to: SECURITY_PATH,
      search: (previous) => ({
        ...previous,
        changed: toLandingKey(PASSKEY_LANDING_KIND, passkey.id),
      }),
      ignoreBlocker: true,
    });
  };

  const showFailure = (error: Error): void => {
    setRejection(toPasskeyErrorMessage(error));
  };

  const add = (): void => {
    setRejection(null);
    mutation.mutate(undefined, { onSuccess: landOnPasskey, onError: showFailure });
  };

  return { isAvailable, isAdding: mutation.isPending, rejection, add };
};
