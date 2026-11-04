import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { releaseThisDevice } from '@/features/push/push-sync';
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

const signOutThisDevice = async (): Promise<void> => {
  await releaseThisDevice();
  await signOut();
};

export const useSignOutMutation = (): UseMutationResult<void, Error, void> =>
  useMutation({ mutationFn: signOutThisDevice });
