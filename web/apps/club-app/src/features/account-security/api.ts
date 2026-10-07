import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import type { MePasskey } from '@/lib/api/schemas';
import {
  endSessionWithFarewell,
  signInWithIssuedTokens,
  signOut,
  withFreshAccessToken,
} from '@/lib/api/session/session-store';
import { addPasskey } from '@/lib/passkey/passkey-flows';
import { resolveReauthenticationProof } from './reauthentication';
import {
  requestAccountDeletion,
  requestLoginEmailChange,
  requestLoginEmailConfirmation,
  requestLogoutEverywhere,
  requestPasskeyRemoval,
  requestPasswordChange,
} from './requests';
import type { LoginEmailChange, LoginEmailForm, PasswordForm } from './schemas';
import type { ReauthenticationProof } from './types';

export const useLoginEmailChangeMutation = (): UseMutationResult<
  LoginEmailChange,
  Error,
  LoginEmailForm
> =>
  useMutation({
    mutationFn: (form: LoginEmailForm) =>
      withFreshAccessToken((accessToken) => requestLoginEmailChange(form, accessToken)),
  });

export const useLoginEmailConfirmationMutation = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      withFreshAccessToken((accessToken) => requestLoginEmailConfirmation(code, accessToken)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};

export const usePasswordChangeMutation = (): UseMutationResult<void, Error, PasswordForm> =>
  useMutation({
    mutationFn: async (form: PasswordForm) => {
      const tokens = await withFreshAccessToken((accessToken) =>
        requestPasswordChange(form, accessToken),
      );
      await signInWithIssuedTokens(tokens);
    },
  });

export const useLogoutEverywhereMutation = (): UseMutationResult<void, Error, void> =>
  useMutation({
    mutationFn: async () => {
      await withFreshAccessToken(requestLogoutEverywhere);
      await signOut();
    },
  });

export const useAccountDeletionMutation = (): UseMutationResult<
  void,
  Error,
  ReauthenticationProof
> =>
  useMutation({
    mutationFn: async (proof: ReauthenticationProof) => {
      const resolved = await resolveReauthenticationProof(proof);
      await withFreshAccessToken((accessToken) => requestAccountDeletion(resolved, accessToken));
      endSessionWithFarewell('account-deleted');
    },
  });

export const useAddPasskeyMutation = (): UseMutationResult<MePasskey, Error, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPasskey,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
    },
  });
};

export const usePasskeyRemovalMutation = (): UseMutationResult<void, Error, string> =>
  useMutation({
    mutationFn: (passkeyId: string) =>
      withFreshAccessToken((accessToken) => requestPasskeyRemoval(passkeyId, accessToken)),
  });
