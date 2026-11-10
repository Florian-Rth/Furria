import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestPromoMembers } from './requests';
import type { PromoMembersResponse } from './schemas';

const POLL_MS = 4000;

export const usePromoMembersQuery = (): UseQueryResult<PromoMembersResponse, Error> =>
  useQuery({
    queryKey: queryKeys.promoMembers,
    queryFn: () => withFreshAccessToken(requestPromoMembers),
    refetchInterval: POLL_MS,
    refetchIntervalInBackground: true,
  });
