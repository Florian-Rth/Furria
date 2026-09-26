import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ME_QUERY_KEY } from '@/features/session';
import {
  endSessionWithFarewell,
  signInWithIssuedTokens,
  signOut,
  withFreshAccessToken,
} from '@/lib/api/session/session-store';
import {
  requestAccountDeletion,
  requestLoginEmailChange,
  requestLoginEmailConfirmation,
  requestLogoutEverywhere,
  requestPasswordChange,
} from './requests';
import type { LoginEmailChange, LoginEmailForm, PasswordForm } from './schemas';

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

export const useAccountDeletionMutation = (): UseMutationResult<void, Error, string> =>
  useMutation({
    mutationFn: async (password: string) => {
      await withFreshAccessToken((accessToken) => requestAccountDeletion(password, accessToken));
      endSessionWithFarewell('account-deleted');
    },
  });
