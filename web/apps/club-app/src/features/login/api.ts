import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { signIn, signInWithIssuedTokens } from '@/lib/api/session/session-store';
import { provePasskey } from '@/lib/passkey/passkey-flows';
import { requestPasskeyLogin } from './requests';
import type { LoginForm } from './schemas';

export const useSignInMutation = (): UseMutationResult<void, Error, LoginForm> =>
  useMutation({ mutationFn: (credentials: LoginForm) => signIn(credentials) });

export const usePasskeySignInMutation = (): UseMutationResult<void, Error, void> =>
  useMutation({
    mutationFn: async () => {
      const attempt = await provePasskey();
      await signInWithIssuedTokens(await requestPasskeyLogin(attempt));
    },
  });
