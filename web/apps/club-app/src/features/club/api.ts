import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestClubHub } from './requests';
import type { ClubHub } from './schemas';

export const CLUB_HUB_QUERY_KEY = ['club-hub'] as const;

export const useClubHubQuery = (): UseQueryResult<ClubHub, Error> =>
  useQuery({
    queryKey: CLUB_HUB_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestClubHub),
  });
