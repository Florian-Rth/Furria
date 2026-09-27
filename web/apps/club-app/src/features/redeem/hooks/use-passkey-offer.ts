import { useState } from 'react';
import { useAddPasskeyMutation } from '@/features/account-security';
import { toPasskeyErrorMessage } from '@/lib/passkey/passkey-messages';

export interface PasskeyOfferControl {
  isSettingUp: boolean;
  rejection: string | null;
  setUp: () => void;
}

export const usePasskeyOffer = (onDone: () => void): PasskeyOfferControl => {
  const mutation = useAddPasskeyMutation();
  const [rejection, setRejection] = useState<string | null>(null);

  const showFailure = (error: Error): void => {
    setRejection(toPasskeyErrorMessage(error));
  };

  return {
    isSettingUp: mutation.isPending,
    rejection,
    setUp: () => {
      setRejection(null);
      mutation.mutate(undefined, { onSuccess: onDone, onError: showFailure });
    },
  };
};
