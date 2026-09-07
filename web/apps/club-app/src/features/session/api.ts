import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Me } from '@/lib/api/schemas';
import { requestMe } from '@/lib/api/session/auth-api';
import { signOut, withFreshAccessToken } from '@/lib/api/session/session-store';

export const ME_QUERY_KEY = ['auth', 'me'] as const;

export const useMeQuery = (): UseQueryResult<Me, Error> =>
  useQuery({ queryKey: ME_QUERY_KEY, queryFn: () => withFreshAccessToken(requestMe) });

export const useSignOutMutation = (): UseMutationResult<void, Error, void> =>
  useMutation({ mutationFn: () => signOut() });
