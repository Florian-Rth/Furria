import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { WINDOW_CLOSED_NOTICE, WINDOW_OPENED_NOTICE } from './claim-window-copy';
import type { WindowClaim } from './requests';
import {
  requestClaimWindowClose,
  requestClaimWindowOpen,
  requestClaimWindowOverview,
  requestClaimWindowStatus,
  requestWindowClaim,
} from './requests';
import type { ClaimWindowOverview, ClaimWindowStatus, WindowClaimResult } from './schemas';

const OVERVIEW_POLL_MS = 5000;

export const useClaimWindowStatusQuery = (): UseQueryResult<ClaimWindowStatus, Error> =>
  useQuery({ queryKey: queryKeys.claimWindowStatus, queryFn: requestClaimWindowStatus });

export const useWindowClaimMutation = (): UseMutationResult<
  WindowClaimResult,
  Error,
  WindowClaim
> => useMutation({ mutationFn: requestWindowClaim });

export const useClaimWindowOverviewQuery = (
  enabled = true,
): UseQueryResult<ClaimWindowOverview, Error> =>
  useQuery({
    queryKey: queryKeys.claimWindowOverview,
    queryFn: () => withFreshAccessToken(requestClaimWindowOverview),
    refetchInterval: OVERVIEW_POLL_MS,
    enabled,
  });

export const useOpenClaimWindowMutation = (): UseMutationResult<void, Error, string> =>
  useApiMutation({
    request: requestClaimWindowOpen,
    changes: ['claimWindow'],
    notice: { success: () => WINDOW_OPENED_NOTICE },
  });

export const useCloseClaimWindowMutation = (): UseMutationResult<void, Error, undefined> =>
  useApiMutation({
    request: (_input: undefined, accessToken: string) => requestClaimWindowClose(accessToken),
    changes: ['claimWindow'],
    notice: { success: () => WINDOW_CLOSED_NOTICE },
  });
