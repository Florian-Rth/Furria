import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { requestClubHub } from './requests';
import type { ClubHub } from './schemas';

export const useClubHubQuery = (): UseQueryResult<ClubHub, Error> =>
  useQuery({
    queryKey: queryKeys.clubHub,
    queryFn: () => withFreshAccessToken(requestClubHub),
  });
