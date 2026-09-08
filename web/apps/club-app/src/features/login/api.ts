import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { signIn } from '@/lib/api/session/session-store';
import type { LoginForm } from './schemas';

export const useSignInMutation = (): UseMutationResult<void, Error, LoginForm> =>
  useMutation({ mutationFn: (credentials: LoginForm) => signIn(credentials) });
