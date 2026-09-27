import { toPasskeyErrorMessage } from '@/lib/passkey/passkey-messages';
import { usePasskeySupport } from '@/lib/passkey/use-passkey-support';
import { usePasskeySignInMutation } from '../api';

interface PasskeySignInControl {
  isAvailable: boolean;
  isSigningIn: boolean;
  errorMessage: string | null;
  signIn: () => void;
}

export const usePasskeySignIn = (): PasskeySignInControl => {
  const isAvailable = usePasskeySupport();
  const mutation = usePasskeySignInMutation();

  return {
    isAvailable,
    isSigningIn: mutation.isPending,
    errorMessage: toPasskeyErrorMessage(mutation.error),
    signIn: () => {
      mutation.mutate();
    },
  };
};
