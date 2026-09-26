import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { NoContent } from '@/lib/api/schemas';
import { getSessionSnapshot, signOut } from '@/lib/api/session/session-store';
import type { PasswordResetRequest } from './requests';
import { requestPasswordReset, resetPassword } from './requests';

export const useRequestPasswordResetMutation = (): UseMutationResult<NoContent, Error, string> =>
  useMutation({ mutationFn: requestPasswordReset });

export const useResetPasswordMutation = (): UseMutationResult<void, Error, PasswordResetRequest> =>
  useMutation({
    mutationFn: async (request: PasswordResetRequest) => {
      await resetPassword(request);
      if (getSessionSnapshot().status === 'authenticated') {
        await signOut();
      }
    },
  });
