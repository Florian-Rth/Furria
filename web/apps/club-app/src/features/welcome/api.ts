import type { UseMutationResult } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import type { Me } from '@/lib/api/schemas';
import { queryKeys } from '@/lib/query/reads';
import { requestWelcomeSeen } from './requests';

const markedSeen = (current: Me | undefined): Me | undefined =>
  current === undefined || current.welcomeSeenAt !== null
    ? current
    : { ...current, welcomeSeenAt: new Date().toISOString() };

export const useWelcomeSeenMutation = (): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestWelcomeSeen(accessToken),
    optimistic: [optimisticPatch(queryKeys.me, markedSeen)],
    changes: [],
    notice: { failure: () => null },
  });
