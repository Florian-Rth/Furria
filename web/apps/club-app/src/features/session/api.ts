import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { Me } from '@/lib/api/schemas';
import { requestMe } from '@/lib/api/session/auth-api';
import { signOut, withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { useSessionSnapshot } from './hooks/use-session-snapshot';

export const useMeQuery = (): UseQueryResult<Me, Error> => {
  const { status } = useSessionSnapshot();

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => withFreshAccessToken(requestMe),
    enabled: status === 'authenticated',
  });
};

export const useSignOutMutation = (): UseMutationResult<void, Error, void> =>
  useMutation({ mutationFn: () => signOut() });
